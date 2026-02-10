# -*- coding: utf-8 -*-
"""phishing_simulation API 테스트 스크립트. 서버가 http://127.0.0.1:8010 에서 떠 있어야 함."""
import json
import sys
from pathlib import Path

# 프로젝트 루트에서 실행 시 패키지 경로
sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

BASE = "http://127.0.0.1:8010"


def request(method: str, path: str, body: dict | None = None, files: dict | None = None):
    url = f"{BASE}{path}"
    if body and not files:
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Content-Type", "application/json; charset=utf-8")
    elif files:
        import mimetypes
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        lines = []
        for key, (filename, content) in files.items():
            lines.append(f"--{boundary}")
            lines.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"')
            lines.append("Content-Type: application/octet-stream")
            lines.append("")
            lines.append("")
            body_bin = "\r\n".join(lines).encode("utf-8") + content + ("\r\n".encode("utf-8"))
            lines = [f"--{boundary}\r\n".encode("utf-8"), body_bin]
        lines.append(f"--{boundary}--\r\n".encode("utf-8"))
        body_bin = b"".join(lines) if len(lines) > 1 else lines[0]
        req = urllib.request.Request(url, data=body_bin, method=method)
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    else:
        req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.getcode(), json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            out = json.loads(body)
        except Exception:
            out = body
        return e.code, out
    except Exception as e:
        return -1, str(e)


def main():
    ok = 0
    fail = 0

    # 1. Health
    print("=== 1. GET /health ===")
    code, res = request("GET", "/health")
    if code == 200 and res.get("ok"):
        print("OK:", res)
        ok += 1
    else:
        print("FAIL:", code, res)
        fail += 1

    # 2. 전화 시나리오 생성
    print("\n=== 2. POST /phone/scenarios ===")
    code, res = request("POST", "/phone/scenarios", {"category": "검찰/경찰 사칭", "difficulty": 2})
    if code == 200 and "scenario" in res:
        print("OK: scenario.category =", res["scenario"]["category"])
        ok += 1
    else:
        print("FAIL:", code, res)
        fail += 1

    # 3. 전화 세션 생성
    print("\n=== 3. POST /phone/sessions ===")
    code, res = request("POST", "/phone/sessions", {
        "category": "금융기관 사칭",
        "difficulty": 2,
        "recommended_delay_seconds_min": 3,
        "recommended_delay_seconds_max": 5,
    })
    if code == 200 and "sessionId" in res and "firstAssistantMessage" in res:
        session_id = res["sessionId"]
        print("OK: sessionId =", session_id[:20] + "...")
        ok += 1
    else:
        print("FAIL:", code, res)
        fail += 1
        session_id = None

    # 4. 전화 세션 조회
    if session_id:
        print("\n=== 4. GET /phone/sessions/{id} ===")
        code, res = request("GET", f"/phone/sessions/{session_id}")
        if code == 200 and res.get("session_id") == session_id:
            print("OK: session 조회됨")
            ok += 1
        else:
            print("FAIL:", code, res)
            fail += 1

    # 5. 전화 reply (Azure 미설정 시 500 예상)
    if session_id:
        print("\n=== 5. POST /phone/sessions/{id}/reply ===")
        code, res = request("POST", f"/phone/sessions/{session_id}/reply", {"text": "제가 그런 거래 한 적 없는데요?"})
        if code == 200 and "assistantText" in res:
            print("OK: assistantText =", (res["assistantText"][:60] + "..." if len(res["assistantText"]) > 60 else res["assistantText"]))
            ok += 1
        elif code == 500:
            print("SKIP (Azure OpenAI 미설정):", res.get("detail", res))
        else:
            print("FAIL:", code, res)
            fail += 1

    # 6. 문자 시나리오
    print("\n=== 6. POST /message/scenarios ===")
    code, res = request("POST", "/message/scenarios", {"category": "택배 문자", "difficulty": 2})
    if code == 200 and "scenario" in res:
        print("OK: scenario.category =", res["scenario"]["category"])
        ok += 1
    else:
        print("FAIL:", code, res)
        fail += 1

    # 7. 문자 세션 생성
    print("\n=== 7. POST /message/sessions ===")
    code, res = request("POST", "/message/sessions", {
        "category": "계정 정지/보안 경고",
        "difficulty": 1,
        "recommended_delay_seconds_min": 2,
        "recommended_delay_seconds_max": 4,
    })
    if code == 200 and "sessionId" in res:
        msg_session_id = res["sessionId"]
        print("OK: sessionId =", msg_session_id[:20] + "...")
        ok += 1
    else:
        print("FAIL:", code, res)
        fail += 1
        msg_session_id = None

    # 8. 문자 reply
    if msg_session_id:
        print("\n=== 8. POST /message/sessions/{id}/reply ===")
        code, res = request("POST", f"/message/sessions/{msg_session_id}/reply", {"text": "링크 못 누르겠어요"})
        if code == 200 and "assistantText" in res:
            print("OK: assistantText =", (res["assistantText"][:60] + "..." if len(res["assistantText"]) > 60 else res["assistantText"]))
            ok += 1
        elif code == 500:
            print("SKIP (Azure OpenAI 미설정):", res.get("detail", res))
        else:
            print("FAIL:", code, res)
            fail += 1

    # 9. 존재하지 않는 세션 조회 → 404
    print("\n=== 9. GET /phone/sessions/invalid-id (404 기대) ===")
    code, res = request("GET", "/phone/sessions/00000000-0000-0000-0000-000000000000")
    if code == 404:
        print("OK: 404 반환")
        ok += 1
    else:
        print("FAIL: 기대 404, 실제", code, res)
        fail += 1

    print("\n" + "=" * 50)
    print(f"결과: 성공 {ok} / 실패 {fail} / 총 {ok + fail}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
