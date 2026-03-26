from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
try:
    import google.generativeai as genai
except ImportError:
    genai = None
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_with_ai(request):
    try:
        if not settings.GEMINI_API_KEY:
            return Response({'error': 'Server configuration error: Gemini API Key not set'}, status=500)

        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Determine mode
        mode = request.data.get('mode', 'chat') # chat, flashcards, summary
        prompt = request.data.get('prompt')
        context = request.data.get('context', '') # For system instruction or additional context
        
        if not prompt and mode != 'chat': # Chat might just start? No, usually sends message.
            return Response({'error': 'No prompt provided'}, status=400)

        model_name = 'gemini-1.5-flash' # Using flash as in frontend
        
        if mode == 'flashcards':
            model = genai.GenerativeModel(model_name)
            # Flashcard schema
            generation_config = {
                "response_mime_type": "application/json",
            }
            # We append the schema instruction to the prompt or rely on the model's ability if we don't pass strict schema object (Python SDK schema support varies by version, but JSON mode works well with instructions)
            # The frontend prompt already includes "Generate 10...". 
            
            response = model.generate_content(
                prompt, 
                generation_config=generation_config
            )
            return Response({'response': response.text})

        elif mode == 'summary':
            model = genai.GenerativeModel(model_name)
            full_prompt = f"Context: {context}\n\nTask: {prompt}"
            response = model.generate_content(full_prompt)
            return Response({'response': response.text})

        else: # chat
            # For chat, we might need history. 
            # If the frontend manages state, it can send history: [{role: 'user', parts: []}, ...]
            history = request.data.get('history', [])
            
            # Sanitize history for Gemini SDK
            # SDK expects: [{'role': 'user', 'parts': ['text']}, ...]
            formatted_history = []
            for msg in history:
                role = 'user' if msg.get('role') == 'user' else 'model'
                content = msg.get('content', '')
                if content:
                    formatted_history.append({'role': role, 'parts': [content]})
            
            model = genai.GenerativeModel(model_name, system_instruction=context if context else None)
            chat = model.start_chat(history=formatted_history)
            
            response = chat.send_message(prompt)
            return Response({'response': response.text})

    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return Response({'error': str(e)}, status=500)
