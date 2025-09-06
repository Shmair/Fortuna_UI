import { supabase } from '../utils/supabaseClient.js';
import fetch from 'node-fetch';


// Save tailor-made questions to the user's profile
export async function SaveCustomQuestions({ email, questions }) {
  const { error } = await supabase
    .from('profiles')
    .update({ custom_questions: JSON.stringify(questions) })
    .eq('email', email);
  if (error) throw new Error('Failed to save custom questions: ' + error.message);
}



export async function UploadFile({ file }) {
  // Upload file to Supabase Storage and return the public URL
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('policies')
    .upload(fileName, file);
  if (error) {
    throw new Error('File upload failed: ' + error.message);
  }
  // Get public URL or signed URL if bucket is private
  const { data: urlData } = supabase.storage
    .from('policies')
    .getPublicUrl(fileName);
  let fileUrl = urlData?.publicUrl;
  if (!fileUrl) {
    // Generate a signed URL valid for 24 hours
    const { data: signedData, error: signedError } = await supabase.storage
      .from('policies')
      .createSignedUrl(fileName, 60 * 60 * 24);
    if (signedError) throw new Error('Failed to generate signed URL: ' + signedError.message);
    fileUrl = signedData.signedUrl;
  }
  return { file_url: fileUrl };
}


export async function InvokeLLM({ prompt, file_urls, response_json_schema }) {
  // Real LLM integration using OpenAI ChatGPT API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY environment variable not set');

  const systemPrompt = prompt;
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  // Optionally add file URLs to the prompt
  if (file_urls && file_urls.length > 0) {
    messages.push({ role: 'user', content: `File URLs: ${file_urls.join(', ')}` });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.2
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }
  const data = await response.json();
  // Expecting JSON in the response content
  let result;
  try {
    result = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    throw new Error('Failed to parse LLM response as JSON: ' + data.choices[0].message.content);
  }
  return result;
}


