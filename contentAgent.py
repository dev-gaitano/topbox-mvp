from dotenv import load_dotenv
from typing import Any
import json

from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_agent
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper

from agentSetup import model, image_analysis_model, CAPTION_GEN_PROMPT, IMAGE_ANALYSIS_PROMPT, POST_IMAGE_PROMPT_GEN


# Setup environment files
load_dotenv()

# Define Model
model = model

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

# Parse Response Format
caption_res_parser = PydanticOutputParser(pydantic_object=CaptionResponseFormat)

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
def generate_post_caption(
    brand_guidelines: str, post_topic: str, platform: str
) -> dict:
    try:
        # Invoke the agent
        response = post_caption_gen_agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": f"""
                        Use this information to create suitable content
                        {brand_guidelines},\n{platform},\n{post_topic}
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
            "success" : False,
            "message" : "Error generating post caption",
            "error" : str(e)
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

        response = image_analysis_model.invoke([
            {
                "role": "user",
                "content": content
            }
        ])

        # Return the required data
        analysis_result = json.loads(str(response.content))
        print(analysis_result)
        return analysis_result
    except Exception as e:
        print(f"Error analyzing images: {e}")
        return { 
            "success" : False,
            "message" : "Error analyzing images",
            "error" : str(e)
        }


# Generate image prompt
def generate_post_image_prompt(
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
                        Use this information into consideration to create suitable content
                        {brand_guidelines},\n{image_analysis},\n{caption_text},\n{industry}
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
