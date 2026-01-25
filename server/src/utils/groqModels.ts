// Fungsi untuk mencari model yang tersedia secara dinamis
const getActiveModels = async () => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    
    // Ambil semua ID model
    const modelIds: string[] = data.data.map((m: any) => m.id);
    
    // Cari model vision yang tersedia (prioritas Llama 3.2 Vision)
    const visionModel = modelIds.find(id => id.includes("vision")) || "llama-3.2-11b-vision-preview";
    
    // Cari model teks yang tersedia (prioritas Llama 3.1 atau 3.3)
    const textModel = modelIds.find(id => id.includes("llama-3.1-8b") || id.includes("versatile")) || "llama3-8b-8192";

    return { visionModel, textModel };
  } catch (error) {
    // Fallback manual jika API list model gagal
    return { 
      visionModel: "llama-3.2-11b-vision-preview", 
      textModel: "llama-3.1-8b-instant" 
    };
  }
};