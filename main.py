from typing import Any
from flask import Flask, Response, request, jsonify, send_from_directory
from flask_cors import CORS
from databaseConnection import db_connection
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import json
from pathlib import Path
import cloudinary
import cloudinary.uploader

from brandAgent import analyze_brand, generate_brand_guidelines
from contentAgent import analyze_image, generate_post_caption, generate_post_image_prompt, generate_image

# Load environment variables
load_dotenv()

# Define `app`
app = Flask(__name__)

# TODO: Remove `DATA_DIR`
DATA_DIR = Path(__file__).resolve().parent / "data"
UPLOADS_DIR = DATA_DIR / "uploads"

# Setup CORS
CORS(app, resources={
        r"/api/*": {
            "origins": [
            "http://localhost:3000", # Local
            "https://topbox-mvp-git-dev-dev-gaitanos-projects.vercel.app", # dev
            "https://topbox-mvp.vercel.app" # Prod
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)

# Configure cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


# =====================================================
# COMPANIES
# =====================================================
@app.route("/api/companies", methods=["GET"])
def get_companies() -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get all companies from database
        cursor.execute("""
                       SELECT id, name, industry, email, monthly_budget,
                       description, target_audience, unique_value,
                       main_competitors, brand_personality, brand_tone, created_at
                       FROM companies ORDER BY created_at;
                       """)
        rows = cursor.fetchall() or []

        # Store companies in a list of dicts
        companies: list[dict[str, Any]] = [
            {
                "id": r[0],
                "name": r[1],
                "industry": r[2],
                "email": r[3],
                "monthly_budget": r[4],
                "description": r[5],
                "target_audience": r[6],
                "unique_value": r[7],
                "main_competitors": r[8],
                "brand_personality": r[9],
                "brand_tone": r[10],
                "createdAt": r[11].isoformat() if r[11] else None,
            }
            for r in rows
        ]

        return jsonify(companies), 200

    except Exception as e:
        print(f"Error fetching companies: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch companies",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/companies", methods=["POST"])
def create_company() -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get data from input
        company_data: dict[str, Any] | None = request.get_json(silent=True)

        if not company_data:
            return jsonify({
                "success": False,
                "message": "No JSON data provided"
            }), 400

        name: str | None = (company_data.get("businessName") or "").strip()
        industry: str | None = (company_data.get("industry") or "").strip()
        email: str | None = (company_data.get("email") or "").strip()
        monthly_budget_str: str | None = (company_data.get("budget") or "").strip()
        description: str | None = (company_data.get("brandDescription") or "").strip()
        target_audience: str | None = (company_data.get("targetAudience") or "").strip()
        unique_value: str | None = (company_data.get("uniqueValue") or "").strip()
        main_competitors: str | None = (company_data.get("competitors") or "").strip()
        brand_personality: list | None = company_data.get("brandPersonality") or []
        brand_tone: str | None = (company_data.get("tone") or "").strip()
        
        # Check if comapany name was provided
        if not name:
            return jsonify({
                "success": False,
                "message": "Missing company name"
            }), 400

        # Convert budget to integer if provided
        monthly_budget = 0
        if monthly_budget_str:
            try:
                monthly_budget = int(monthly_budget_str)
            except ValueError:
                pass

        # Insert company to database
        cursor.execute(
            """
            INSERT INTO companies (name, industry, email, monthly_budget,
                                   description, target_audience, unique_value,
                                   main_competitors, brand_personality, brand_tone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
            RETURNING id, name, created_at;
            """,
            (name, industry, email, monthly_budget, description, target_audience,
             unique_value, json.dumps([main_competitors] if main_competitors else []),
             json.dumps(brand_personality), brand_tone),
        )
        row = cursor.fetchone()
        conn.commit()

        # Check if row was returned
        if not row:
            return jsonify({
                "success": False,
                "message": "Failed to return created company data",
            }), 500

        return jsonify({
            "success": True,
            "message": "Company created successfully",
            "data": {
                "id": row[0],
                "name": row[1],
                "createdAt": row[2].isoformat() if row[2] else None,
            }
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error creating company: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to create company",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/companies/<int:company_id>", methods=["GET"])
def get_company(company_id) -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get company from database
        cursor.execute(
            """
            SELECT id, name, industry, email, monthly_budget,
                   description, target_audience, unique_value,
                   main_competitors, brand_personality, brand_tone, created_at
            FROM companies
            WHERE id = %s;
            """,
            (company_id,),
        )
        row = cursor.fetchone()

        if not row:
            return jsonify({
                "success": False,
                "message": "Company not found"
            }), 404

        # Store company data in a dict
        company: dict[str, Any] = {
            "id": row[0],
            "name": row[1],
            "industry": row[2],
            "email": row[3],
            "monthly_budget": row[4],
            "description": row[5],
            "target_audience": row[6],
            "unique_value": row[7],
            "main_competitors": row[8],
            "brand_personality": row[9],
            "brand_tone": row[10],
            "createdAt": row[11].isoformat() if row[11] else None,
        }

        return jsonify(company), 200

    except Exception as e:
        print(f"Error fetching company: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch company",
            "error": str(e)
        }), 500
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
    conn = cursor = None

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
def generate_guidelines() -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get company data from questionare
        data = request.get_json()
        company_id = data.get('companyId')
        questionnaire = data.get('questionnaire', {})
        
        # Analyze brand and generate guidelines
        brand_profile = analyze_brand(questionnaire)
        guidelines = generate_brand_guidelines(brand_profile)
        print(f"Brand profile result: {brand_profile}")

        # Check if analyze_brand returned an error
        if not brand_profile.get("success"):
            return jsonify({
                "success": False,
                "message": "Failed to analyze brand",
                "error": brand_profile.get("error", "Unknown error")
            }), 400

        brand_guidelines = generate_brand_guidelines(brand_profile)

        # Insert generated guidelines into database
        cursor.execute(
            """
            INSERT INTO brand_guidelines (company_id, content, generated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (company_id)
            DO UPDATE SET
                content = EXCLUDED.content,
                generated_at = EXCLUDED.generated_at;
            """,
            (company_id, brand_guidelines),
        )
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Guidelines generated successfully",
            "content": brand_guidelines
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to generate guidelines",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/brand-guidelines/save", methods=["POST"])
def save_brand_guidelines() -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        payload = request.get_json(silent=True) or {}
        company_id = payload.get("companyId")
        content = (payload.get("content") or "").strip()

        # Validate the company_id data type
        if not isinstance(company_id, int) or company_id <= 0:
            return jsonify({
                "success": False,
                "message": "Invalid companyId"
            }), 400

        # Check if content is available
        if not content:
            return jsonify({
                "success": False,
                "message": "Missing content"
            }), 400

        # Insert company guidelines into database
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

        return jsonify({
            "success": True,
            "message": "Guidelines saved successfully"
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to save guidelines",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/api/brand-guidelines/<int:company_id>", methods=["GET"])
def get_brand_guidelines(company_id: int) -> tuple[Response, int]:
    conn = cursor = None

    try:
        conn = db_connection()
        cursor = conn.cursor()

        # Get brand guidelines for selected company
        cursor.execute(
            "SELECT content FROM brand_guidelines WHERE company_id = %s;",
            (company_id,),
        )
        row = cursor.fetchone()

        # Check if guidelines exist
        if not row or not row[0]:
            return jsonify({
                "success": False,
                "message": "Company guidelines/content not found",
                "content": None
            }), 200

        return jsonify({
            "success": True,
            "message": "Company guidelines fetched successfully",
            "content": row[0]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to fetch guidelines",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# CONTENT
# =====================================================
@app.route("/api/content/upload_images", methods=["POST"])
def upload_images() -> tuple[Response, int]:
    company_id = int((request.form.get("companyId") or "").strip())

    ref_imgs = request.files.getlist("referenceImages")
     
    if not ref_imgs or all(not f.filename for f in ref_imgs):
        return jsonify({"success": False, "message": "No images provided"}), 400

    uploaded_urls = []
    for f in ref_imgs:
        if not f or not f.filename:
            continue
        result = cloudinary.uploader.upload(
            f,
            folder=f"reference-images/{company_id}"
        )
        uploaded_urls.append(result["secure_url"])

    return jsonify({
        "success": True,
        "message": "Images uploaded successfully",
        "urls": uploaded_urls
    }), 200


@app.route("/api/content/analyze_images", methods=["POST"])
def analyze_images() -> tuple[Response, int]:
    img_data = request.get_json(silent=True) or {}
    img_urls: list | None = img_data.get("urls") or []

    if not img_urls:
        return jsonify({"success": False, "message": "No image URLs provided"}), 400

    results = []
    for url in img_urls:
        img_analysis = analyze_image(url)
        results.append(img_analysis)

    return jsonify({
        "success": True,
        "message": "Images analyzed successfully",
        "analyses": results
    }), 200


@app.route("/api/content/create", methods=["POST"])
def create_content() -> tuple[Response, int]:
    try:
        content_data = request.get_json(silent=True) or {}
        company_id = content_data.get("companyId")
        topic = (content_data.get("topic") or "").strip()
        platform = (content_data.get("platform") or "").strip()
        analyses = content_data.get("analyses") or []

        if not isinstance(company_id, int) or company_id <= 0:
            return jsonify({"success": False, "message": "Invalid companyId"}), 400
        if not topic:
            return jsonify({"success": False, "message": "Missing topic"}), 400
        if not platform:
            return jsonify({"success": False, "message": "Missing platform"}), 400

        # Fetch brand guidelines
        brand_guidelines = "Modern, professional brand with clean aesthetics"
        conn = cursor = None
        try:
            conn = db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT content FROM brand_guidelines WHERE company_id = %s;", (company_id,))
            row = cursor.fetchone()
            if row and row[0]:
                brand_guidelines = row[0].strip()
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
            conn = cursor = None

        # Generate caption and prompt
        caption_data = generate_post_caption(
            brand_guidelines=brand_guidelines,
            post_topic=topic,
            platform=platform
        )
        if caption_data.get("success") is False:
            return jsonify({
                "success": False,
                "message": f"Failed to generate caption: {caption_data.get('error', 'Unknown error')}"
            }), 500

        if not caption_data.get("caption"):
            return jsonify({"success": False, "message": "Caption generation returned an empty result"}), 500

        prompt = generate_post_image_prompt(
            brand_guidelines=brand_guidelines,
            caption_data=caption_data,
            image_analysis=analyses
        )

        hashtags = caption_data.get("hashtags") or []
        caption = caption_data["caption"]
        if hashtags:
            caption = f"{caption}\n\n{' '.join(['#' + tag for tag in hashtags])}"

        # Return to frontend for user review — not saved yet
        return jsonify({
            "success": True,
            "prompt": prompt,
            "caption": caption,
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"success": False, "message": "Failed to create content", "error": str(e)}), 500


@app.route("/api/content/latest", methods=["GET"])
def latest_content() -> Response:
    conn = cursor = None

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
    conn = cursor = None

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

        # Check if row was returned
        if not row:
            return jsonify({
                "success": False,
                "message": "Failed to return saved content",
            })

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
