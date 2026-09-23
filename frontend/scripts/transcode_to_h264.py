import os
import sys
import time
import shutil
import av

INPUT_PATH = "NFD_Junction_annotated_5min.mp4"
OUTPUT_TMP = "NFD_Junction_annotated_5min_h264_tmp.mp4"
BACKUP_PATH = "NFD_Junction_annotated_5min_original.mp4"
FINAL_PATH = "NFD_Junction_annotated_5min.mp4"
PUBLIC_PATH = os.path.join("public", "NFD_Junction_annotated_5min.mp4")

print(f"Starting transcode of {INPUT_PATH} to browser-compatible H.264 (AVC1)...")

t0 = time.time()
input_container = av.open(INPUT_PATH)
input_stream = input_container.streams.video[0]

width = input_stream.codec_context.width
height = input_stream.codec_context.height
fps = float(input_stream.average_rate) if input_stream.average_rate else 25.0
duration = float(input_stream.duration * input_stream.time_base) if input_stream.duration else 300.0
total_frames = int(duration * fps)

print(f"Input stream: {width}x{height} @ {fps} fps (~{total_frames} frames, {duration:.1f}s)")

if os.path.exists(OUTPUT_TMP):
    os.remove(OUTPUT_TMP)

output_container = av.open(OUTPUT_TMP, "w", options={"movflags": "+faststart"})
output_stream = output_container.add_stream("libx264", rate=int(fps))
output_stream.width = width
output_stream.height = height
output_stream.pix_fmt = "yuv420p"
output_stream.options = {
    "preset": "veryfast",
    "crf": "22",
    "tune": "film"
}

frame_count = 0
last_log_time = time.time()

for packet in input_container.demux(input_stream):
    for frame in packet.decode():
        for out_packet in output_stream.encode(frame):
            output_container.mux(out_packet)
        frame_count += 1
        
        now = time.time()
        if now - last_log_time >= 5.0 or frame_count % 500 == 0:
            elapsed = now - t0
            curr_fps = frame_count / elapsed if elapsed > 0 else 0
            pct = (frame_count / total_frames) * 100 if total_frames > 0 else 0
            eta = (total_frames - frame_count) / curr_fps if curr_fps > 0 else 0
            print(f"Frames: {frame_count}/{total_frames} ({pct:.1f}%) | Speed: {curr_fps:.1f} fps | ETA: {eta:.1f}s")
            last_log_time = now

# Flush encoder
print("Flushing encoder...")
for out_packet in output_stream.encode():
    output_container.mux(out_packet)

output_container.close()
input_container.close()

total_time = time.time() - t0
avg_fps = frame_count / total_time
print(f"Encoding complete! {frame_count} frames encoded in {total_time:.1f}s ({avg_fps:.1f} fps).")

orig_size = os.path.getsize(INPUT_PATH)
new_size = os.path.getsize(OUTPUT_TMP)
print(f"Original size: {orig_size / (1024*1024):.1f} MB -> New H.264 size: {new_size / (1024*1024):.1f} MB")

# Verify the newly encoded file with PyAV
test_c = av.open(OUTPUT_TMP)
v = test_c.streams.video[0]
print(f"Verification: codec={v.codec_context.name}, width={v.width}, height={v.height}, duration={float(v.duration * v.time_base) if v.duration else None}s")
test_c.close()

# Safe replacement
if not os.path.exists(BACKUP_PATH):
    print(f"Backing up original video to {BACKUP_PATH}...")
    shutil.copy2(INPUT_PATH, BACKUP_PATH)

print(f"Replacing {FINAL_PATH} with browser-compatible H.264 video...")
os.replace(OUTPUT_TMP, FINAL_PATH)

# Update public/ copy or link
if os.path.exists(PUBLIC_PATH):
    os.remove(PUBLIC_PATH)
try:
    os.link(FINAL_PATH, PUBLIC_PATH)
    print(f"Created NTFS hard link in {PUBLIC_PATH}")
except Exception:
    shutil.copy2(FINAL_PATH, PUBLIC_PATH)
    print(f"Copied to {PUBLIC_PATH}")

print("Transcode process finished successfully!")
