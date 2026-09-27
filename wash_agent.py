import asyncio
import os
import cv2
from inference_sdk import InferenceHTTPClient
from google.antigravity import Agent, LocalAgentConfig

# 1. Define the Handwash Analysis Tool
def analyze_handwash_frame() -> str:
    """
    Captures a single frame from the camera mirror, queries the pre-trained WHO handwashing model (hand_wansh.),
    and returns the child's active step.
    """
    # Open camera briefly to capture frame
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return "Error: Camera feed unavailable."
        
    try:
        # Initialize the serverless endpoint client
        api_key = os.environ.get("ROBOFLOW_API_KEY", "YOUR_PRIVATE_ROBOFLOW_API_KEY")
        client = InferenceHTTPClient(
            api_url="https://detect.roboflow.com",
            api_key=api_key # Replace with your developer key or set ROBOFLOW_API_KEY env var
        )
        
        # Run inference against the recommended object detection model
        predictions = client.infer(frame, model_id="handwash-j49en/hand_wansh./1")
        detected_objects = predictions.get("predictions", [])
        
        if not detected_objects:
            return "No handwashing step detected. Encourage the child to begin!"
            
        # Grab the bounding box with the highest model confidence
        best_match = max(detected_objects, key=lambda x: x['confidence'])
        step_name = best_match['class'] # e.g. step_1, step_2
        confidence = best_match['confidence']
        
        return f"Detected: {step_name} with {confidence*100:.1f}% accuracy."
    except Exception as e:
        return f"Model integration error: {str(e)}"

# 2. Wire the Tool into the Antigravity Autonomous Loop
async def main():
    # Inject the handwash routine straight into the agent's workspace capabilities
    config = LocalAgentConfig(
        system_instructions=(
            "You are an interactive, encouraging AI companion for children washing their hands. "
            "Use the analyze_handwash_frame tool to check their posture. Give them gamified, "
            "fun feedback based on the WHO step detected (like 'Soap time! Rub those palms!')."
        ),
        tools=[analyze_handwash_frame] # Binds the custom python execution
    )
    
    async with Agent(config) as agent:
        # Example interaction prompt simulated in the platform session
        response = await agent.chat("Check the child's current handwashing step and respond to them.")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
