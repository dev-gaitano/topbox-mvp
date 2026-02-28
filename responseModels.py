from pydantic import BaseModel, Field
from typing import Optional

class Metadata(BaseModel):
    confidence_score: str
    image_type: str
    primary_purpose: str

class Composition(BaseModel):
    rule_applied: str
    aspect_ratio: str
    layout: str
    focal_points: list[str]
    visual_hierarchy: str
    balance: str

class DominantColor(BaseModel):
    color: str
    hex: str
    percentage: str
    role: str

class ColorProfile(BaseModel):
    dominant_colors: list[DominantColor]
    color_palette: str
    temperature: str
    saturation: str
    contrast: str

class Shadows(BaseModel):
    type: str
    density: str
    placement: str
    length: str

class Highlights(BaseModel):
    treatment: str
    placement: str

class Lighting(BaseModel):
    type: str
    source_count: str
    direction: str
    directionality: str
    quality: str
    intensity: str
    contrast_ratio: str
    mood: str
    shadows: Shadows
    highlights: Highlights
    ambient_fill: str
    light_temperature: str

class TechnicalSpecs(BaseModel):
    medium: str
    style: str
    texture: str
    sharpness: str
    grain: str
    depth_of_field: str
    perspective: str

class ArtisticElements(BaseModel):
    genre: str
    influences: list[str]
    mood: str
    atmosphere: str
    visual_style: str

class Font(BaseModel):
    type: str
    weight: str
    characteristics: str

class Typography(BaseModel):
    present: bool
    fonts: list[Font]
    placement: str
    integration: str

class FacialExpression(BaseModel):
    mouth: str
    smile_intensity: str
    eyes: str
    eyebrows: str
    overall_emotion: str
    authenticity: str

class Hair(BaseModel):
    length: str
    cut: str
    texture: str
    texture_quality: str
    natural_imperfections: str
    styling: str
    styling_detail: str
    part: str
    volume: str
    details: str

class HandsAndGestures(BaseModel):
    left_hand: str
    right_hand: str
    finger_positions: str
    finger_interlacing: str
    hand_tension: str
    interaction: str
    naturalness: str

class BodyPositioning(BaseModel):
    posture: str
    angle: str
    weight_distribution: str
    shoulders: str

class SubjectAnalysis(BaseModel):
    primary_subject: str
    positioning: str
    scale: str
    interaction: str
    facial_expression: FacialExpression
    hair: Hair
    hands_and_gestures: HandsAndGestures
    body_positioning: BodyPositioning

class BackgroundElement(BaseModel):
    item: str
    position: str
    distance: str
    size: str
    condition: str
    specific_features: str

class WallSurface(BaseModel):
    material: str
    surface_treatment: str
    texture: str
    finish: str
    color: str
    color_variation: str
    features: str
    wear_indicators: str

class FloorSurface(BaseModel):
    material: str
    color: str
    pattern: str

class Background(BaseModel):
    setting_type: str
    spatial_depth: str
    elements_detailed: list[BackgroundElement]
    wall_surface: WallSurface
    floor_surface: FloorSurface
    objects_catalog: str
    background_treatment: str

class GenerationParameters(BaseModel):
    prompts: list[str]
    keywords: list[str]
    technical_settings: str
    post_processing: str

class ImageAnalysisResponseFormat(BaseModel):
    metadata: Metadata
    composition: Composition
    color_profile: ColorProfile
    lighting: Lighting
    technical_specs: TechnicalSpecs
    artistic_elements: ArtisticElements
    typography: Typography
    subject_analysis: SubjectAnalysis
    background: Background
    generation_parameters: GenerationParameters
