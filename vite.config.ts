import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const MODEL_NAME = 'gemini-1.5-flash';

function geminiApiPlugin(apiKey: string): Plugin {
  const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing GEMINI_API_KEY in server environment.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk);
          const rawBody = Buffer.concat(chunks).toString('utf-8') || '{}';
          const { url } = JSON.parse(rawBody) as { url?: string };

          if (!url) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'URL is required.' }));
            return;
          }

          const prompt = `
            I am providing a video link from a platform like Reddit, YouTube, X, TikTok, or Instagram: ${url}

            Your task:
            1. Use your internal knowledge and search capabilities to understand the content of this video.
            2. Based on the video's content, write 3 DIFFERENT versions of a horrific, scary, and shocking script.
            3. Each script must be exactly one amazing paragraph.
            4. Create a perfect, bone-chilling title for each script version.
            5. IMPORTANT: The titles must use EASY, SIMPLE WORDS that are easy to understand.

            STYLE GUIDELINES (MANDATORY):
            - TONE: Visceral, clinical, unsettling, and descriptive.
            - VOCABULARY: Use words like "clinical silence", "violent, impossible strength", "pale, spasming hand", "raw scraping of bone", "defies every law of the living", "localized agony", "spectral remnant", "hollow pits".
            - STRUCTURE: Start with a setting of eerie stillness or normalcy, introduce a sudden, unnatural movement or presence, and end with a bone-chilling realization or a final horrific action.
            - FOCUS: Emphasize the "unnatural" behavior of the physical world or the dead.

            REFERENCE EXAMPLE:
            "The clinical silence of the morgue is broken as a nurse slides a heavy steel tray into its cooling unit. Just as she begins to latch the door, the 'remains' inside surge with a violent, impossible strength. A pale, spasming hand shoots out from the gap, fingers clawing desperately against the metal frame in a deliberate grasp. It isn’t a post-mortem twitch; it is a conscious, predatory reach from a body that has no pulse. The raw scraping of bone against steel is enough to send the worker sprinting into the hall, leaving the door ajar for whatever just woke up in the dark."

            Return the response in JSON format:
            {
              "versions": [
                { "title": "Simple Title 1", "script": "Horrific script 1..." },
                { "title": "Simple Title 2", "script": "Horrific script 2..." },
                { "title": "Simple Title 3", "script": "Horrific script 3..." }
              ]
            }
          `;

          const baseRequest = {
            model: MODEL_NAME,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json',
            },
          };

          let response;
          try {
            response = await genAI.models.generateContent({
              ...baseRequest,
              config: {
                ...baseRequest.config,
                tools: [{ googleSearch: {} }],
              },
            });
          } catch {
            response = await genAI.models.generateContent(baseRequest);
          }

          const text = response.text;
          if (!text) {
            throw new Error('Empty response from Gemini.');
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(text);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown server error';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `${message}. Check that Gemini API is enabled for this key in Google AI Studio.` }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin(env.GEMINI_API_KEY || env.GOOGLE_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
