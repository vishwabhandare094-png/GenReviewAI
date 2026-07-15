import itertools

import requests

url = "https://sxqeciffmnujffwxasal.supabase.co"

# Placeholder value to exercise the mutation logic without exposing a real secret.
base_key = "sb_secret_example_key_12345"

mutations = {
    18: ["l", "I", "1"],
    20: ["I", "l", "1"],
    37: ["o", "0", "O"],
    40: ["q", "g"],
}

url_mutations = [
    "https://sxqeciffmnujffwxasal.supabase.co",
    "https://sxqeciffmnujffwxasai.supabase.co",
    "https://sxqeciffmnujffwxas1.supabase.co",
    "https://sxqeoiffmnujffwxasal.supabase.co",
]


def probe_key(url, key):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    try:
        res = requests.get(f"{url}/rest/v1/users", headers=headers, timeout=3)
        return res.status_code, res.text
    except Exception as exc:
        return None, str(exc)


def test_probe_key_and_key_generation(monkeypatch):
    class DummyResponse:
        status_code = 200
        text = '{"ok": true}'

    monkeypatch.setattr(requests, "get", lambda *args, **kwargs: DummyResponse())
    code, text = probe_key("https://example.supabase.co", "abc")
    assert code == 200
    assert text == '{"ok": true}'

    keys_to_test = []
    indices = list(mutations.keys())
    options = list(mutations.values())

    for comb in itertools.product(*options):
        key_list = list(base_key)
        for idx, char in zip(indices, comb):
            key_list[idx] = char
        keys_to_test.append("".join(key_list))

    assert keys_to_test
    assert len(keys_to_test) == 3 * 3 * 3 * 2
    assert any(key.startswith("sb_secret_") for key in keys_to_test)
    assert url in url_mutations
