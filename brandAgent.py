from dotenv import load_dotenv
import json
from typing import Any, Optional
from werkzeug.datastructures import FileStorage
import pdfplumber
import io

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_agent


# Setup environment files
load_dotenv()

# Define Model
model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    max_retries=2,
)

# Response format
class BrandAnalysisResponseFormat(BaseModel):
    brand_voice: list[str] = Field( description="3-5 adjectives that express the brand voice")
    color_palette: list[str] = Field(
        description="""5 hex colors that match the industry and vibe
            (primary, secondary, accent, text, background)"""
    )
    typography: Optional[str] = Field(default=None, description="Typography description")
    content_themes: list[str] = Field(description="5-10 relevant posting themes")
    target_audience: str = Field(description="Target audience description")
    posting_style: str = Field(description="Posting style description")
    industry: Optional[str] = Field(default=None, description="Industry name")

# Parse Response Format
brand_analysis_res_parser = PydanticOutputParser(pydantic_object=BrandAnalysisResponseFormat)

# Define Brand Analysis System Prompt
BRAND_ANALYSIS_SYSTEM_PROMPT = """
    You are a brand strategy expert.
    Analyze the provided data and create a comprehensive brand profile.

    Generate a structured brand profile with:
    1. Brand Voice (3-5 adjectives, e.g., "professional, friendly, innovative")
    2. Color Palette (5 hex colors that match the industry and vibe)
    3. Typography (font style recommendation, e.g., "Modern sans-serif with clean lines")
    4. Content Themes (5-10 topics they should post about)
    5. Target Audience (brief description)
    6. Posting Style (casual/professional/inspirational etc.)
    7. Industry (the industry this brand operates in)

    If any information is not explicitly mentioned, make a reasonable
    inference based on the overall brand tone.
"""

GUIDELINE_MERGING_PROMPT = """
    You are a brand strategy expert. You have two brand profiles for the same company:

    Merge these into a single, superior brand profile that takes the best of both.
    Favour the uploaded guidelines for factual details like colors and typography since
    they come from an official document, but use the AI-generated profile to fill in
    any gaps or enrich areas that are vague or missing.
"""

# Define tools
brand_analysis_tools = []

# Define Agents
brand_analysis_agent = create_agent(
   model, 
   tools=brand_analysis_tools,
   system_prompt=BRAND_ANALYSIS_SYSTEM_PROMPT,
   response_format=BrandAnalysisResponseFormat,
)

guideline_merging_agent = create_agent(
   model, 
   tools=brand_analysis_tools,
   system_prompt=GUIDELINE_MERGING_PROMPT,
   response_format=BrandAnalysisResponseFormat,
)


# Analyze brand from questionnaire data
def analyze_brand(questionnaire_data: dict) -> dict[str, Any]:
    try:
        # Invoke the agent
        response = brand_analysis_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"Analyze this questionnaire data:\n{json.dumps(questionnaire_data, indent=2)}"
                }
            ]
        })

        # Return the required data
        return response["structured_response"].model_dump()
    except Exception as e:
        print(f"Error in analyze_brand(): {str(e)}")
        return { 
            "success" : False,
            "message" : "Error analyzing brand",
            "error" : str(e)
        }


# Analyze uploaded brand guidelines
def analyze_uploaded_guidelines(uploaded_file: FileStorage) -> dict[str, Any]:
    try:
        # Get file
        file_bytes = uploaded_file.read()

        # Extract text from pdf file
        file_text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                file_text += page.extract_text() or ""

        # Invoke the agent
        response = brand_analysis_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"Analyze this data:\n{file_text}"
                }
            ]
        })

        # Return the required data
        return response["structured_response"].model_dump()
    except Exception as e:
        print(f"Error in analyze_uploaded_guidelines(): {str(e)}")
        return {
            "success": False,
            "message": "Error analyzing uploaded guidelines",
            "error": str(e)
        }


# Merge brand guidelines
def merge_brand_profiles(generated_profile: dict, uploaded_analysis: dict) -> dict[str, Any]:
    try:
        # Invoke the agent
        response = guideline_merging_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"""
                        Here are the two brand profiles:
                        1. AI-Generated Profile (based on a questionnaire):
                        {json.dumps(generated_profile, indent=2)}

                        2. Uploaded Brand Guidelines Profile (extracted from their official document):
                        {json.dumps(uploaded_analysis, indent=2)}
                    """
                }
            ]
        })

        # Return the required data
        return response["structured_response"].model_dump()
    except Exception as e:
        print(f"Error in merge_brand_guidelines(): {str(e)}")
        return {
            "success": False,
            "message": "Error merging brand profiles",
            "error": str(e)
        }


#Generate brand guidelines
def generate_brand_guidelines(brand_profile: dict, uploaded_analysis: dict | None = None) -> str:
    try:
        if uploaded_analysis and "brand_voice" in uploaded_analysis:
            brand_profile = merge_brand_profiles(brand_profile, uploaded_analysis)

        # Check if brand_profile is an error response
        if "success" in brand_profile and not brand_profile.get("success"):
            error_msg = brand_profile.get("error", "Unknown error")
            return f"Error generating brand guidelines: {error_msg}"
        
        # Check if required keys exist
        required_keys = ['brand_voice', 'color_palette', 'industry', 'target_audience', 'content_themes', 'posting_style']
        missing_keys = [key for key in required_keys if key not in brand_profile]
        
        if missing_keys:
            return f"Error: Missing required brand profile data: {', '.join(missing_keys)}"
        
        guidelines: str = f"""
# BRAND GUIDELINES

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

        return guidelines
    except Exception as e:
        print(f"Error in generate_brand_guidelines(): {str(e)}")
        return f"Error generating guidelines: {str(e)}"
