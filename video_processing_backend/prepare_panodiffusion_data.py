import cv2
import os
import shutil
import numpy as np
import glob
from moviepy import VideoFileClip, ImageSequenceClip
  

def process_video(
    input_path,
    frame_output_folder="PanoDiffusion/example/rgb", 
    mask_output_folder="PanoDiffusion/example/mask",
    max_fps=30
):
    # Clear the frame_output_folder and mask_output_folder images
    if os.path.exists(frame_output_folder):
        shutil.rmtree(frame_output_folder) 
    os.mkdir(frame_output_folder)

    if os.path.exists(mask_output_folder):
        shutil.rmtree(mask_output_folder) 
    os.mkdir(mask_output_folder)

    # Open the video file
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: Unable to open {input_path}")
        return

    # Get original FPS
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"Original FPS: {original_fps:.2f}")

    # Determine skip rate to not exceed max_fps
    skip_rate = 1
    if original_fps > max_fps:
        skip_rate = int(round(original_fps / max_fps))

    # Target canvas size
    CANVAS_WIDTH = 1024
    CANVAS_HEIGHT = 512

    # Target resized frame height
    RESIZED_HEIGHT = 128

    frame_count = 0
    saved_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # No more frames or error reading

        # Skip frames if needed
        if frame_count % skip_rate == 0:
            orig_height, orig_width = frame.shape[:2]
            aspect_ratio = orig_width / orig_height

            new_height = RESIZED_HEIGHT
            new_width = int(aspect_ratio * new_height)

            resized_frame = cv2.resize(
                frame, 
                (new_width, new_height), 
                interpolation=cv2.INTER_AREA
            )

            canvas = ( 
                np.zeros((CANVAS_HEIGHT, CANVAS_WIDTH, 3), dtype=np.uint8)
            )

            x_offset = (CANVAS_WIDTH - new_width) // 2
            y_offset = (CANVAS_HEIGHT - new_height) // 2

            canvas[
                y_offset : y_offset + new_height, 
                x_offset : x_offset + new_width
            ] = resized_frame

            mask = np.ones((CANVAS_HEIGHT, CANVAS_WIDTH), dtype=np.uint8) * 255
            mask[
                y_offset : y_offset + new_height, 
                x_offset : x_offset + new_width
            ] = 0

            frame_output_path = os.path.join(
                frame_output_folder, f"frame_{saved_count:05d}.png"
            )
            mask_output_path = os.path.join(
                mask_output_folder, f"mask_{saved_count:05d}.png"
            )

            cv2.imwrite(frame_output_path, canvas)
            cv2.imwrite(mask_output_path, mask)

            saved_count += 1

        frame_count += 1

    cap.release()
    print(f"Done. Extracted {saved_count} frames with max {max_fps} FPS.")


# def frames_to_video_w_audio(input_video_path, input_folder="PanoDiffusion/example/output", output_video="final_output/output.mp4", fps=30):
#     # Gather all image paths in sorted order
#     frames = sorted(glob.glob(os.path.join(input_folder, "*.*")))
#     if not frames:
#         print(f"No frames found in '{input_folder}'.")
#         return

#     # Read the first frame to get height/width
#     sample_frame = cv2.imread(frames[0])
#     if sample_frame is None:
#         print(f"Unable to read the first frame: {frames[0]}")
#         return

#     height, width, channels = sample_frame.shape

#     # Define codec and create VideoWriter
#     fourcc = cv2.VideoWriter_fourcc(*'mp4v')
#     out = cv2.VideoWriter(output_video, fourcc, fps, (width, height))

#     # Write each frame to the video
#     for frame_path in frames:
#         frame = cv2.imread(frame_path)
#         if frame is not None:
#             out.write(frame)
#         else:
#             print(f"Warning: unable to read {frame_path}, skipping.")

#     out.release()
#     print(f"Video saved to '{output_video}' at {fps} FPS.")


def frames_to_video_w_audio_moviepy(input_video_path, 
                                    input_folder="PanoDiffusion/example/output", 
                                    output_video="final_output/output_with_audio.mp4", 
                                    fps=30):
    # Gather all image paths in sorted order
    frames = sorted(glob.glob(os.path.join(input_folder, "*.*")))
    print(frames)
    if not frames:
        print(f"No frames found in '{input_folder}'.")
        return

    # Create a video clip from image sequence
    clip = ImageSequenceClip(frames, fps=fps)

    # Load the audio from the input video
    video_with_audio = VideoFileClip(input_video_path)
    audio = video_with_audio.audio

    # Set the audio to the image sequence clip
    final_clip = clip.with_audio(audio)

    # Write the final video with audio
    final_clip.write_videofile(output_video, codec='libx264', audio_codec='aac')
    print(f"Video with audio saved to '{output_video}'.")

# frames_to_video()
# input_video_path = "video_for_processing/IMG_2054.mp4"
# process_video(input_video_path)