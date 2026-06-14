const SKILLS_DB = [
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'ruby', 'php', 'go', 'rust',
  'swift', 'kotlin', 'scala', 'perl', 'r', 'matlab', 'dart', 'elixir', 'haskell', 'lua',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'express', 'django', 'flask',
  'spring boot', 'rails', 'laravel', 'asp.net', 'fastapi', 'node.js', 'deno', 'bun',
  'tailwind', 'bootstrap', 'sass', 'less', 'styled-components', 'material-ui', 'chakra',
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'mariadb', 'cassandra', 'elasticsearch',
  'dynamodb', 'firebase', 'supabase', 'oracle', 'sql server',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'github actions', 'gitlab ci', 'circleci', 'travis ci', 'nginx', 'apache',
  'graphql', 'rest api', 'grpc', 'websocket', 'oauth', 'jwt',
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'notion',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
  'data science', 'data analysis', 'tableau', 'power bi', 'excel', 'sql',
  'agile', 'scrum', 'kanban', 'leadership', 'communication', 'teamwork',
  'product management', 'project management', 'ux design', 'ui design', 'figma', 'sketch',
  'testing', 'jest', 'mocha', 'cypress', 'playwright', 'selenium', 'pytest',
  'linux', 'unix', 'bash', 'powershell', 'networking', 'security'
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = SKILLS_DB.filter(skill => lower.includes(skill.toLowerCase()));
  return [...new Set(found)];
}

function calculateMatchScore(resumeText, jobSkills) {
  const resumeSkills = extractSkills(resumeText);
  if (!jobSkills || jobSkills.length === 0) return { score: 0, matched: [], missing: resumeSkills };
  const matched = jobSkills.filter(s => resumeSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rs.toLowerCase())));
  const missing = jobSkills.filter(s => !matched.includes(s));
  const score = Math.round((matched.length / jobSkills.length) * 100);
  return { score, matched, missing, allResumeSkills: resumeSkills };
}

module.exports = { extractSkills, calculateMatchScore, SKILLS_DB };
