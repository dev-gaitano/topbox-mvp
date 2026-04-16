from dotenv import load_dotenv
from typing import Any
import json

from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper

from agentSetup import model, image_analysis_model, CAPTION_GEN_PROMPT, IMAGE_ANALYSIS_PROMPT, POST_IMAGE_PROMPT_GEN
from responseModels import ImageAnalysisResponseFormat


# Setup environment files
load_dotenv()

# Response format
class CaptionResponseFormat(BaseModel):
    caption: str = Field(description="The main post caption text")
    hashtags: list[str] = Field(description="5-10 relevant post hashtags")
    cta: str = Field(description="Call to action text")
    hook: str = Field(description="Attention-grabbing first line")

class ImagePromptResponseFormat(BaseModel):
    post_topic: str = Field(description="Post topic of generated prompt")
    prompt: str = Field(description="Image generation prompt")
    aspect_ratio: str = Field(description="Aspect ration of the image to be generated")

# Define models
post_caption_gen_agent = create_agent(
   model, 
   tools=[],
   system_prompt=CAPTION_GEN_PROMPT,
   response_format=CaptionResponseFormat,
)

post_image_prompt_gen_agent = create_agent(
   model, 
   tools=[],
   system_prompt=POST_IMAGE_PROMPT_GEN,
   response_format=ImagePromptResponseFormat,
)


# Generate post caption
def generate_caption(
    brand_guidelines: str,
    post_topic: str,
    platform: str,
    image_analysis: dict | list | None = None,
) -> dict:
    try:
        # Build a human-readable summary of the reference image analyses
        analysis_snippet = ""
        if image_analysis:
            try:
                if isinstance(image_analysis, list):
                    summary_parts: list[str] = []
                    for idx, item in enumerate(image_analysis, start=1):
                        if not isinstance(item, dict):
                            continue
                        meta = item.get("metadata", {}) or {}
                        color_profile = item.get("color_profile", {}) or {}
                        lighting = item.get("lighting", {}) or {}
                        artistic = item.get("artistic_elements", {}) or {}
                        summary_parts.append(
                            f"Image {idx}: type={meta.get('image_type')}, "
                            f"purpose={meta.get('primary_purpose')}, "
                            f"palette={color_profile.get('color_palette')}, "
                            f"lighting_mood={lighting.get('mood')}, "
                            f"light_temperature={lighting.get('light_temperature')}, "
                            f"style={artistic.get('visual_style')}, "
                            f"atmosphere={artistic.get('atmosphere')}."
                        )
                    analysis_snippet = "\n".join(summary_parts)
                elif isinstance(image_analysis, dict):
                    meta = image_analysis.get("metadata", {}) or {}
                    color_profile = image_analysis.get("color_profile", {}) or {}
                    lighting = image_analysis.get("lighting", {}) or {}
                    artistic = image_analysis.get("artistic_elements", {}) or {}
                    analysis_snippet = (
                        "Single reference image: "
                        f"type={meta.get('image_type')}, "
                        f"purpose={meta.get('primary_purpose')}, "
                        f"palette={color_profile.get('color_palette')}, "
                        f"lighting_mood={lighting.get('mood')}, "
                        f"light_temperature={lighting.get('light_temperature')}, "
                        f"style={artistic.get('visual_style')}, "
                        f"atmosphere={artistic.get('atmosphere')}."
                    )
            except Exception:
                analysis_snippet = ""

        # Invoke the agent
        response = post_caption_gen_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"""
                        Use this information to create suitable social media content.

                        Brand guidelines:
                        {brand_guidelines}

                        Platform:
                        {platform}

                        Post topic:
                        {post_topic}

                        Reference image analysis (use this to align the caption with the visual style, subjects, mood, and composition of the images):
                        {analysis_snippet}
                    """
                }
            ]
        })

        # Return the required data
        print(response["structured_response"].model_dump())
        return response["structured_response"].model_dump()
    except Exception as e:
        print("Error generating post caption")
        return {
            "success": False,
            "message": "Error generating post caption",
            "error": str(e)
        }


# Analyze image
def analyze_images(public_image_urls: list[str]) -> dict:
    try:
        content: list[dict[str, Any]] = [{
            "type": "text",
            "text": IMAGE_ANALYSIS_PROMPT
        }]

        for url in public_image_urls:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": url,
                    "detail": "high"
                }
            })

        structured_model = image_analysis_model.with_structured_output(ImageAnalysisResponseFormat)
        response = structured_model.invoke([
            {
                "role": "user",
                "content": content
            }
        ])

        # Return the required data
        print(response.model_dump())
        return response.model_dump()
    except Exception as e:
        print(f"Error analyzing images: {e}")
        return { 
            "success" : False,
            "message" : "Error analyzing images",
            "error" : str(e)
        }


# Generate image prompt
def generate_image_prompt(
    brand_guidelines: str,
    caption_data: dict,
    image_analysis: dict | list
) -> str:
    try:
        caption_text = caption_data.get('caption', '')
        industry = 'general business'
        if 'Industry' in brand_guidelines:
            try:
                industry = brand_guidelines.split('Industry')[1].split('\n')[0].strip()
            except Exception:
                pass

        # Invoke the agent
        response = post_image_prompt_gen_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"""
                        Use the following information to create a DALL-E image prompt that matches the visual style and subjects of the reference images.

                        Brand guidelines:
                        {brand_guidelines}

                        Platform industry:
                        {industry}

                        Generated caption text:
                        {caption_text}

                        Reference image analysis (this describes the composition, color palette, lighting, technical style, mood, and subject details of each reference image; base the new image on this style so it looks like it came from the same shoot):
                        {image_analysis}
                    """
                }
            ]
        })

        # Return the required data
        print(response["structured_response"].prompt)
        return response["structured_response"].prompt
    except Exception as e:
        print(f"Error generating image prompt: {e}")
        return f"Error generating image prompt: {e}"


# Generate image
def generate_image(image_prompt: str, size: str) -> str:
    try:
        dalle = DallEAPIWrapper(
            model="dall-e-3",
            size=size,
            n=1,
        )

        url = dalle.run(image_prompt)

        print(url)
        return url
    except Exception as e:
        print(f"Error generating image: {e}")
        return f"Error generating image: {e}"
