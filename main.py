from flask import Flask, Response, request, jsonify, send_from_directory
from flask_cors import CORS
from databaseConnection import db_connection
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import json
from pathlib import Path

from brandAgent import analyze_brand, generate_brand_guidelines
from contentAgent import analyze_image, generate_post_caption, generate_post_image_prompt, generate_image

# Config
load_dotenv()

app = Flask(__name__)

DATA_DIR = Path(__file__).resolve().parent / "data"
UPLOADS_DIR = DATA_DIR / "uploads"


CORS(app, resources={
        r"/api/*": {
            "origins": [
            "http://localhost:3000", # Local
            "https://topbox-mvp.vercel.app" # Prod
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)


# =====================================================
# HEALTH
# =====================================================
@app.route("/api/health", methods=["GET"])
def health() -> Response:
    return jsonify({"ok": True})


# =====================================================
# COMPANIES
# =====================================================
@app.route("/api/companies", methods=["GET"])
def get_companies() -> Response:
    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, created_at FROM companies ORDER BY id;")
        rows = cursor.fetchall() or []

        companies = [
            {
                "id": r[0],
                "name": r[1],
                "createdAt": r[2].isoformat() if r[2] else None,
            }
            for r in rows
        ]

        return jsonify(companies)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to fetch companies",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/companies", methods=["POST"])
def create_company() -> Response:
    conn = None
    cursor = None

    try:
        payload = request.get_json(silent=True) or {}
        name = (payload.get("businessName") or "").strip()
        industry = (payload.get("industry") or "").strip()
        email = (payload.get("email") or "").strip()
        monthly_budget_str = (payload.get("budget") or "").strip()
        description = (payload.get("brandDescription") or "").strip()
        target_audience = (payload.get("targetAudience") or "").strip()
        unique_value = (payload.get("uniqueValue") or "").strip()
        main_competitors = (payload.get("competitors") or "").strip()
        brand_personality = payload.get("brandPersonality") or []
        brand_tone = (payload.get("tone") or "").strip()
        platforms = payload.get("platforms") or []
        
        if not name:
            return jsonify({
                "success": False,
                "message": "Missing company name"
            })

        # Convert budget to integer if provided
        monthly_budget = 0
        if monthly_budget_str:
            try:
                monthly_budget = int(monthly_budget_str)
            except ValueError:
                pass

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO companies (name, industry, email, monthly_budget, description, target_audience, unique_value, main_competitors, brand_personality, brand_tone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
            RETURNING id, name, created_at;
            """,
            (name, industry, email if email else None, monthly_budget, description, target_audience, unique_value, json.dumps([main_competitors] if main_competitors else []), json.dumps(brand_personality), brand_tone),
        )
        row = cursor.fetchone()
        conn.commit()

        return jsonify(
            {
                "id": row[0],
                "name": row[1],
                "createdAt": row[2].isoformat() if row[2] else None,
            }
        )

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to create company",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# BRAND GUIDELINES
# =====================================================
@app.route("/api/brand-guidelines/upload", methods=["POST"])
def upload_brand_guidelines() -> Response:
    conn = None
    cursor = None

    try:
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "message": "Missing file"
            })

        file = request.files["file"]
        company_id_raw = (request.form.get("companyId") or "").strip()
        if not company_id_raw.isdigit():
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            })
        company_id = int(company_id_raw)

        if not file.filename:
            return jsonify({
                "success": False,
                "message": "Empty filename"
            })

        filename = secure_filename(file.filename)
        company_dir = UPLOADS_DIR / "brand-guidelines" / str(company_id)
        company_dir.mkdir(parents=True, exist_ok=True)
        path = company_dir / filename
        file.save(path)

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO brand_guidelines (company_id, file_filename, file_path, uploaded_at)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (company_id)
            DO UPDATE SET
                file_filename = EXCLUDED.file_filename,
                file_path = EXCLUDED.file_path,
                uploaded_at = EXCLUDED.uploaded_at;
            """,
            (company_id, filename, str(path.relative_to(DATA_DIR))),
        )
        conn.commit()

        return jsonify(
            {
                "success": True,
                "ok": True,
                "fileUrl": f"/uploads/{path.relative_to(UPLOADS_DIR).as_posix()}",
            }
        )

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to upload guidelines",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/brand-guidelines/generate", methods=["POST"])
def generate_guidelines() -> Response:
    conn = None
    cursor = None

    try:
        payload = request.get_json(silent=True) or {}
        company_id = payload.get("companyId")

        if not isinstance(company_id, int) or company_id <= 0:
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            })

        # Accept a rich questionnaire from the frontend, with fallbacks
        questionnaire_data = {
            "business_name": (payload.get("businessName") or f"Company {company_id}").strip(),
            "industry": (payload.get("industry") or "General").strip(),
            "target_audience": (payload.get("targetAudience") or "Modern consumers").strip(),
            "brand_description": (payload.get("brandDescription") or payload.get("prompt") or "").strip(),
            "tone": (payload.get("tone") or "").strip(),
            "competitors": (payload.get("competitors") or "").strip(),
            "unique_value": (payload.get("uniqueValue") or "").strip(),
        }

        if not questionnaire_data["brand_description"]:
            return jsonify({
                "success": False,
                "message": "Missing brand description"
            })

        brand_profile = analyze_brand(questionnaire_data)
        print(f"[DEBUG] Brand profile result: {brand_profile}")

        # Check if analyze_brand returned an error
        if "success" in brand_profile and not brand_profile.get("success"):
            return jsonify({
                "success": False,
                "message": "Failed to analyze brand",
                "error": brand_profile.get("error", "Unknown error")
            })

        guidelines = generate_brand_guidelines(brand_profile)

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO brand_guidelines (company_id, content, generated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (company_id)
            DO UPDATE SET
                content = EXCLUDED.content,
                generated_at = EXCLUDED.generated_at;
            """,
            (company_id, guidelines),
        )
        conn.commit()

        return jsonify({"success": True, "content": guidelines})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to generate guidelines",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/brand-guidelines/save", methods=["POST"])
def save_brand_guidelines() -> Response:
    conn = None
    cursor = None

    try:
        payload = request.get_json(silent=True) or {}
        company_id = payload.get("companyId")
        content = (payload.get("content") or "").strip()

        if not isinstance(company_id, int) or company_id <= 0:
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            })
        if not content:
            return jsonify({
                "success": False,
                "message": "Missing content"
            })

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO brand_guidelines (company_id, content, saved_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (company_id)
            DO UPDATE SET
                content = EXCLUDED.content,
                saved_at = EXCLUDED.saved_at;
            """,
            (company_id, content),
        )
        conn.commit()

        return jsonify({"success": True, "ok": True})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to save guidelines",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# CONTENT
# =====================================================
@app.route("/api/content/create", methods=["POST"])
def create_content() -> Response:
    conn = None
    cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        company_id_raw = (request.form.get("companyId") or "").strip()
        topic = (request.form.get("topic") or "").strip()
        platform = (request.form.get("platform") or "").strip()

        if not company_id_raw.isdigit():
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            })
        company_id = int(company_id_raw)
        if not topic:
            return jsonify({
                "success": False,
                "message": "Missing topic"
            })
        if not platform:
            return jsonify({
                "success": False,
                "message": "Missing platform"
            })
        # -------------------------------------------------
        # Fetch brand guidelines (if any) for this company
        # -------------------------------------------------
        cursor.execute("SELECT content FROM brand_guidelines WHERE company_id = %s;", (company_id,))
        row = cursor.fetchone()
        brand_guidelines = (row[0] or "").strip() if row else ""
        
        # If no brand guidelines exist, use a simple default
        if not brand_guidelines:
            brand_guidelines = "Modern, professional brand with clean aesthetics"

        # -------------------------------------------------
        # Use visual analysis + caption + image prompt agents
        # -------------------------------------------------
        # For now we use a fixed public inspiration image for style analysis.
        # (User-uploaded images are saved locally and not directly accessible to OpenAI.)
        img_path = "https://res.cloudinary.com/diwkfbsgv/image/upload/v1771261031/prompt_eng-05_ygdmvu.jpg"
            
        # Analyze the reference image style
        image_analysis = analyze_image(img_path)

        # Generate caption
        caption_data = generate_post_caption(
            brand_guidelines=brand_guidelines,
            post_topic=topic,
            platform=platform
        )

        # Generate image prompt using style analysis + caption
        prompt = generate_post_image_prompt(
            brand_guidelines=brand_guidelines,
            caption_data=caption_data,
            image_analysis=image_analysis
        )

        # Generate the actual image (not yet persisted in DB, but returned to client)
        image_url = generate_image(prompt, size="1024x1024")
        
        # Format caption with hashtags
        caption = f"{caption_data['caption']}\n\n{' '.join(['#' + tag for tag in caption_data['hashtags']])}"

        uploaded_urls = []
        images = request.files.getlist("referenceImages") or []
        if images:
            company_dir = UPLOADS_DIR / "reference-images" / str(company_id)
            company_dir.mkdir(parents=True, exist_ok=True)
            for f in images:
                if not f or not f.filename:
                    continue
                filename = secure_filename(f.filename)
                path = company_dir / filename
                f.save(path)
                uploaded_urls.append(f"/uploads/{path.relative_to(UPLOADS_DIR).as_posix()}")

        cursor.execute(
            """
            INSERT INTO content_posts (company_id, topic, platform, reference_image_urls, prompt, caption)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s)
            RETURNING id, company_id, topic, platform, reference_image_urls::text, prompt, caption, created_at, updated_at;
            """,
            (company_id, topic, platform, json.dumps(uploaded_urls), prompt, caption),
        )
        saved = cursor.fetchone()
        conn.commit()

        reference_urls = json.loads(saved[4] or "[]")

        return jsonify(
            {
                "id": saved[0],
                "imageUrl": image_url,
                "companyId": saved[1],
                "topic": saved[2],
                "platform": saved[3],
                "referenceImageUrls": reference_urls,
                "prompt": saved[5] or "",
                "caption": saved[6] or "",
                "createdAt": saved[7].isoformat() if saved[7] else None,
                "updatedAt": saved[8].isoformat() if saved[8] else None,
            }
        )

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to create content",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/content/latest", methods=["GET"])
def latest_content() -> Response:
    conn = None
    cursor = None

    try:
        company_id_raw = (request.args.get("companyId") or "").strip()
        if not company_id_raw.isdigit():
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
                })
        company_id = int(company_id_raw)

        conn = db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, company_id, topic, platform, reference_image_urls::text, prompt, caption, created_at, updated_at
            FROM content_posts
            WHERE company_id = %s
            ORDER BY created_at DESC
            LIMIT 1;
            """,
            (company_id,),
        )
        row = cursor.fetchone()

        if not row:
            return jsonify(
                {
                    "companyId": company_id,
                    "topic": "",
                    "platform": "",
                    "prompt": "",
                    "caption": "",
                    "referenceImageUrls": [],
                }
            )

        return jsonify(
            {
                "id": row[0],
                "companyId": row[1],
                "topic": row[2],
                "platform": row[3],
                "referenceImageUrls": json.loads(row[4] or "[]"),
                "prompt": row[5] or "",
                "caption": row[6] or "",
                "createdAt": row[7].isoformat() if row[7] else None,
                "updatedAt": row[8].isoformat() if row[8] else None,
            }
        )

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to fetch latest content",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/content/save", methods=["POST"])
def save_content() -> Response:
    conn = None
    cursor = None

    try:
        payload = request.get_json(silent=True) or {}

        company_id = payload.get("companyId")
        topic = (payload.get("topic") or "").strip()
        platform = (payload.get("platform") or "").strip()
        prompt = (payload.get("prompt") or "").strip()
        caption = (payload.get("caption") or "").strip()
        post_id = payload.get("id")

        if not isinstance(company_id, int) or company_id <= 0:
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            })
        if not topic or not platform:
            return jsonify({
                "success": False,
                "message": "Missing topic or platform"
            })

        conn = db_connection()
        cursor = conn.cursor()

        row = None
        if isinstance(post_id, int):
            cursor.execute(
                """
                UPDATE content_posts
                SET company_id = %s,
                    topic = %s,
                    platform = %s,
                    prompt = %s,
                    caption = %s,
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id, company_id, topic, platform, reference_image_urls::text, prompt, caption, created_at, updated_at;
                """,
                (company_id, topic, platform, prompt, caption, post_id),
            )
            row = cursor.fetchone()

        if not row:
            cursor.execute(
                """
                INSERT INTO content_posts (company_id, topic, platform, prompt, caption, reference_image_urls, updated_at)
                VALUES (%s, %s, %s, %s, %s, '[]'::jsonb, NOW())
                RETURNING id, company_id, topic, platform, reference_image_urls::text, prompt, caption, created_at, updated_at;
                """,
                (company_id, topic, platform, prompt, caption),
            )
            row = cursor.fetchone()

        conn.commit()

        return jsonify(
            {
                "id": row[0],
                "companyId": row[1],
                "topic": row[2],
                "platform": row[3],
                "referenceImageUrls": json.loads(row[4] or "[]"),
                "prompt": row[5] or "",
                "caption": row[6] or "",
                "createdAt": row[7].isoformat() if row[7] else None,
                "updatedAt": row[8].isoformat() if row[8] else None,
            }
        )

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to save content",
            "error": str(e)
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# UPLOADS
# =====================================================
@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_uploads(filename: str):
    return send_from_directory(str(UPLOADS_DIR), filename)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
