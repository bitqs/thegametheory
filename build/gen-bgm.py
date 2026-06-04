# build/gen-bgm.py — ElevenLabs Music 生成 bgm 原始素材，写 audio/bgm-raw.mp3。
# 计费！每次生成消耗 ElevenLabs 额度。之后用 ffmpeg 做首尾 crossfade 得到无缝循环 bgm.mp3。
#   ELEVENLABS_API_KEY=sk_... python3 build/gen-bgm.py
#   BGM_LEN_MS=120000 python3 build/gen-bgm.py   # 自定义时长（默认 90s）
import json
import os
import urllib.request

KEY = os.environ["ELEVENLABS_API_KEY"]
LEN = int(os.environ.get("BGM_LEN_MS", "90000"))

# 电影级氛围弦乐（A24/《降临》向）：低沉持续、无旋律钩子、动态平稳——垫底不抢 SFX
PROMPT = (
    "Instrumental cinematic ambient underscore: deep sustained low strings, "
    "slowly evolving cello and viola drones, subtle airy string harmonics, "
    "faint sub bass swells, distant shimmering textures. Mysterious, "
    "contemplative, restrained, elegant, like a prestige film score. Very slow, "
    "quiet, consistent dynamics throughout, no melodic hooks, no percussion, "
    "strictly instrumental, no vocals. Smooth seamless loop."
)


def main():
    body = {"prompt": PROMPT, "music_length_ms": LEN, "model_id": "music_v1"}
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/music",
        data=json.dumps(body).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=600) as r:
        audio = r.read()
    out = "audio/bgm-raw.mp3"
    with open(out, "wb") as f:
        f.write(audio)
    print(f"{out}: {len(audio)} bytes (~{LEN / 1000:.0f}s)")


if __name__ == "__main__":
    main()
