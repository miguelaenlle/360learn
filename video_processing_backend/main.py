import os
import time
import yaml
import shutil
import urllib.request

import pymongo
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from prepare_panodiffusion_data import frames_to_video_w_audio_moviepy, process_video
from pymongo import MongoClient

# Load the environment variables from the .env file
load_dotenv()

# Retrieve the environment variables
mongo_uri = os.environ.get("MONGO_URI")
db_name = os.environ.get("DB_NAME")
blob_connection_string = os.environ.get("BLOB_CONNECTION_STRING")

# Connect to MongoDB
client = MongoClient(mongo_uri)

blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)
container = 'edited-video'

db = client[db_name]

tasks_collection = db.tasks
steps_collection = db.steps

while True:
    # 1. Retrieve the most recently created task
    task = tasks_collection.find_one(
        sort=[("createdAt", pymongo.DESCENDING)]
    )


    if not task:
        print("No tasks found. Sleeping for a bit...")
        time.sleep(5)  # or break, depending on your use case
        continue

    task_id = task["_id"]
    step_id = task["stepId"]
    video_url = task["videoUrl"]
    edit_type = task["editType"]

    print(f"Working on Task ID: {task_id}, Edit Type: {edit_type}")

    # 2. Update the task's status to 'In progress'
    tasks_collection.update_one(
        {"_id": task_id},
        {"$set": {"status": "In progress"}}
    )

    # 3. Update the corresponding step based on editType
    if edit_type == "360":
        new_step_status = "Generating 360 degree video"
    else:  # edit_type == "edit"
        new_step_status = "Video is processing"

    steps_collection.update_one(
        {"_id": step_id},
        {"$set": {"videoUploadStatus": new_step_status}}
    )

    # 4. Simulate doing the actual work (replace time.sleep with your real work)
    print("Performing the video processing...")

    if edit_type == "360":
        ## Generate the panoramic video placeholder
        ## TODO: Generate the actual panoramic video
        ## Collate the outputs (for now, just the placeholder)
        ## Upload into blob storage
        video_base_path = f'video_for_processing_pano_diffusion'
        os.makedirs(video_base_path, exist_ok=True)

        # Download the placeholder video
        video_path = os.path.join(video_base_path, "unedited_video.mp4")
        urllib.request.urlretrieve(video_url, video_path)

        # Prepare the panodiffusion folders
        process_video(video_path)

        ## TODO: Call panodiffusion
        time.sleep(5)

        # Collate the output video
        frames_to_video_w_audio_moviepy(
            video_path,
            "PanoDiffusion/example/rgb", ## TODO: Change to output (when you have the panodiffusion model ready)
            "video_for_processing_pano_diffusion/output.mp4"
        )

        blob_name = f"{task_id}_edited_video.mp4"

        # Upload it to blob storage
        blob_client = blob_service_client.get_blob_client(
            container=container,
            blob=blob_name
        )

        # Retrieve the link
        with open("video_for_processing_pano_diffusion/output.mp4", "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            edited_video_url = blob_client.url

        # Update the step status
        steps_collection.update_one(
            {"_id": step_id},
            {"$set": {"videoURL": edited_video_url, "videoUploadStatus": "Video processed"}}
        )
        print(f"360 degree video generated and uploaded to '{edited_video_url}'.")

    else:
        edit_description = task["editDescription"]
        # Download the placeholder video
        video_path = os.path.join("video_for_processing", "unedited_video.mp4")
        urllib.request.urlretrieve(video_url, video_path)

        # Generate the yaml file in a customized yaml file
        template_config_path = os.path.join("RAVE", "configs", "_template-config.yaml")
        input_dict_list = yaml.load(open(template_config_path, 'r'), Loader=yaml.FullLoader)

        input_dict_list['video_name'] = step_id
        input_dict_list['positive_prompts'] = edit_description
        input_dict_list['save_folder'] = 'video_for_processing_RAVE'

        # Save to a new yaml file
        new_config_path = os.path.join("RAVE", "configs", f"custom-config.yaml")
        with open(new_config_path, 'w') as f:
            yaml.dump(input_dict_list, f)

        # TODO: Call the RAVE model (for now, just export the video to an output folder)
        time.sleep(5)
        
        shutil.copy(video_path, 'video_for_processing_RAVE/output.mp4')

        # Upload the final video to blob storage
        blob_name = f"{task_id}_edited_video.mp4"

        blob_client = blob_service_client.get_blob_client(
            container=container,
            blob=blob_name
        )

        with open("video_for_processing_RAVE/output.mp4", "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            edited_video_url = blob_client.url

        # Update the step status
        steps_collection.update_one(
            {"_id": step_id},
            {"$set": {"videoURL": edited_video_url, "videoUploadStatus": "Video processed"}}
        )
        print(f"Edited video generated and uploaded to '{edited_video_url}'.")

    print(f"Step {step_id} marked as Done.")

    # 5. Remove (delete) the completed task
    tasks_collection.delete_one({"_id": task_id})
    print(f"Task {task_id} removed from queue.\n")

    # Loop continues to process the next available task
