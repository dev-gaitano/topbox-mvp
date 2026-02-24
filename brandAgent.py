from dotenv import load_dotenv
import os
import json
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_brand(questionnaire_data: dict) -> dict:
    try:
        SYSTEM_PROMPT = f"""
        You are a brand strategy expert.
        Analyze this questionnaire and create a comprehensive brand profile.

        Questionnaire Data:
        {json.dumps(questionnaire_data, indent=2)}

        Generate a structured brand profile with:
        1. Brand Voice (3-5 adjectives, e.g., "professional, friendly, innovative")
        2. Color Palette (5 hex colors that match the industry and vibe)
        3. Content Themes (5 topics they should post about)
        4. Target Audience (brief description)
        5. Posting Style (casual/professional/inspirational etc.)

        Return ONLY a valid JSON object with these exact keys:
        {{
            "brand_voice": ["adj1", "adj2", "adj3"],
            "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
            "typography": "typography",
            "content_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
            "target_audience": "description",
            "posting_style": "style description",
            "industry": "industry name"
        }}
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role" : "user",
                "content" : SYSTEM_PROMPT,
                }],
            temperature=0.7,
            response_format={"type" : "json_object"}
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return { 
            "success" : False,
            "message" : "Error analyzing brand",
            "error" : str(e)
        }

def generate_brand_guidelines(brand_profile: dict) -> str:
    try:
        # Check if brand_profile is an error response
        if "success" in brand_profile and not brand_profile.get("success"):
            error_msg = brand_profile.get("error", "Unknown error")
            return f"Error generating brand guidelines: {error_msg}"
        
        # Check if required keys exist
        required_keys = ['brand_voice', 'color_palette', 'industry', 'target_audience', 'content_themes', 'posting_style']
        missing_keys = [key for key in required_keys if key not in brand_profile]
        
        if missing_keys:
            return f"Error: Missing required brand profile data: {', '.join(missing_keys)}"
        
        guidelines: str = f"""# BRAND GUIDELINES

## Brand Voice
{', '.join(brand_profile['brand_voice'])}

## Color Palette
{', '.join(brand_profile['color_palette'])}

## Industry
{brand_profile['industry']}

## Target Audience
{brand_profile['target_audience']}

## Content Themes
{', '.join(brand_profile['content_themes'])}

## Posting Style
{brand_profile['posting_style']}"""

        print(f"Brand profile: {brand_profile}")
        return guidelines
    except Exception as e:
        print(f"Error in generate_brand_guidelines: {str(e)}")
        return f"Error generating guidelines: {str(e)}"
