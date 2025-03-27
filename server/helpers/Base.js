import { OpenAI } from "openai";
export default class Base {
  static openai = new OpenAI({
      apiKey: "YOUR_OPENAI_OR_ANTHROPIC_API_KEY",
      baseURL: "ANTHROPIC_API_BASE_URL", // Optional
    });
  static model = "claude-3-7-sonnet-latest";

  /**
   * 
   * @param {*} messages 
   */
  static async run(messages) {
    return this.openai.chat.completions.create({
      model: this.model,
      messages,
    });
  }

}
