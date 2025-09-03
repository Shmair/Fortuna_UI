import { supabase } from '../utils/supabaseClient';

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
  // Simulate LLM response for coverage analysis
  return {
    coverage_analysis: [
      {
        service_name: "בדיקות דם",
        category: "בדיקות",
        initial_question: "האם ביצעת בדיקות דם?",
        follow_up_questions: ["האם הבדיקה בוצעה במסגרת פרטית?"],
        refund_details: {
          refund_amount: "350",
          coverage_percentage: "80%",
          eligibility_conditions: "גיל 18 ומעלה, חברי כללית בלבד",
          required_documents: "טופס בקשה, הפניה מרופא",
          description: "החזר עבור בדיקות דם שגרתיות"
        }
      }
    ]
  };
}
