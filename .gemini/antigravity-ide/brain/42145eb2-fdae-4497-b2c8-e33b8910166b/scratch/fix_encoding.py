import os

file_path = r'C:\Users\Asus\OneDrive\Desktop\vihil\vihil_website\robot_voice_assistant\main.py'

# Read file as binary
with open(file_path, 'rb') as f:
    content = f.read()

# Dynamically locate the boundaries
start_marker = b'    "hi": "'
end_marker = b'HTML_CONTENT = """<!DOCTYPE html>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

print(f"start_idx: {start_idx}, end_idx: {end_idx}")

if start_idx != -1 and end_idx != -1:
    # We want to replace everything from start_idx up to end_idx + len(end_marker)
    # Let's inspect what is currently in between
    print("Found sequence:")
    print(repr(content[start_idx:end_idx + len(end_marker)]))
    
    # Correct Hindi intro + syntax structure + start of HTML_CONTENT
    replacement = (
        '    "hi": "नमस्ते! विहिल इन्फोटेक में आपका स्वागत है। मैं आपकी वर्चुअल होस्ट हूँ, '
        'और मुझे हमारी कंपनी का परिचय देने में बेहद खुशी हो रही है। विहिल इन्फोटेक में, हम हाई-परफॉर्मेंस वेब डेवलपमेंट, '
        'मोबाइल ऐप्स और क्लाउड सॉल्यूशंस में विशेषज्ञता रखते हैं, जिसमें आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग का विशेष फोकस है। '
        'चाहे आप एक नया स्टार्टअप हों जो अपना पहला MVP लॉन्च करना चाहते हैं, या एक स्थापित उद्यम जो डिजिटल परिवर्तन की तलाश में हैं, '
        'हमारे समर्पित तकनीकी विशेषज्ञों की टीम आपकी दृष्टि को स्केलेबल और सुरक्षित वास्तविकता में बदलने के लिए यहाँ है। '
        'हमसे मिलने के लिए धन्यवाद, और हम आपके साथ मिलकर कुछ असाधारण बनाने की उम्मीद करते हैं।"\n'
        '}\n\n'
        'HTML_CONTENT = """<!DOCTYPE html>'
    ).encode('utf-8')
    
    new_content = content[:start_idx] + replacement + content[end_idx + len(end_marker):]
    
    with open(file_path, 'wb') as f:
        f.write(new_content)
    print("Success! Replaced the corrupted region dynamically.")
else:
    print("Error: Markers not found!")
