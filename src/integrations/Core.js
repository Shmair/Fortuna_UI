// Mock integrations for file upload and LLM invocation

export async function UploadFile({ file }) {
  // Simulate file upload and return a mock URL
  return { file_url: "https://example.com/mock-policy.pdf" };
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
