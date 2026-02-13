from dotenv import load_dotenv
import os
import json
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_post_caption(
    brand_guidelines: str, post_topic: str, platform: str
) -> dict:
    try:
        SYSTEM_PROMPT: str = f"""
        You are a social media expert creating {platform} content.

        {brand_guidelines}

        Task: Create an engaging {platform} post about: {post_topic}

        Requirements:
        - Match the brand voice perfectly
        - Include relevant hashtags (5-10)
        - Optimal length for {platform}
        - Include a call-to-action
        - Make it engaging and authentic

        Return a JSON object:
        {{
            "caption": "the main post text",
            "hashtags": ["hashtag1", "hashtag2"],
            "cta": "call to action text",
            "hook": "attention-grabbing first line"
        }}
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": SYSTEM_PROMPT
            }],
            temperature=0.6,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        result = { 
            "success" : False,
            "message" : "Error generating post caption",
            "error" : str(e)
        }
        print(result)
        return result


def generate_post_image_prompt(brand_guidelines: str, caption_data: dict) -> str:
    try:
        SYSTEM_PROMPT = f"""
        You are an expert at creating prompts for AI image generation.

        {brand_guidelines}

        Post Caption: {caption_data['caption']}

        Create a detailed DALL-E prompt for an Instagram post image that:
        - Matches the brand's color palette
        - Reflects the brand voice visually
        - Is professional and engaging
        - Works well for {brand_guidelines.split('Industry')[1].split('\n')[0].strip() if 'Industry' in brand_guidelines else 'general business'}

        Return ONLY the DALL-E prompt text, nothing else. Make it detailed and specific.
        Maximum 400 characters.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": SYSTEM_PROMPT
            }],
            temperature=0.7,
            max_tokens=150
        )

        print(response.choices[0].message.content.strip())
        return response.choices[0].message.content.strip()
    except Exception as e:
        result = f"""
            \"success\" : {False},
            \"message\" : \"Error generating image prompt\",
            \"error\" : {str(e)}
        """
        print(result)
        return result

def generate_image(image_prompt: str, size: str) -> str:
    try:
        response = client.images.generate(
            model="dall-e-2",
            prompt=image_prompt,
            size=size,
            n=1,
        )

        return response.data[0].url
    except Exception as e:
        result = f"""
            \"success\" : {False},
            \"message\" : \"Error generating image url\",
            \"error\" : {str(e)}
        """

        print(result)
        return result
