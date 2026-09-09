const axios = require('axios');
async function run() {
  const lines = Array.from({length: 100}).map((_, i) => `This is sentence number ${i}.`);
  const fullText = lines.join('\n');
  const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi`;
  const res = await axios.post(url, `q=${encodeURIComponent(fullText)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const translated = Array.isArray(res.data) ? res.data.join('') : res.data;
  console.log("Input lines:", lines.length);
  console.log("Output lines:", translated.split('\n').length);
}
run().catch(console.error);
