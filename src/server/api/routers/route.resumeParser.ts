import { z } from "zod";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createTRPCRouter } from "~/server/api/trpc";
import { publicProcedure } from "../procedure";

import { env } from "~/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const RESUME_PARSE_PROMPT = `You are an AI assistant specialized in parsing resumes and extracting structured information. Your ONLY task is to extract professional information from resumes and return them as structured JSON data.

CRITICAL RULES:
1. You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
2. Extract information ONLY from the resume text - do not invent or assume information
3. For any field not found in the resume, use null or empty array []
4. Be precise with dates - use YYYY-MM format
5. Extract ALL skills mentioned, categorizing them appropriately
6. Identify technology stacks from project descriptions and work experience
7. Infer experience level based on years of experience and role seniority

JSON FORMAT (return exactly this structure):
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "portfolio": string | null,
  "github": string | null,
  "linkedin": string | null,
  "headline": string | null,
  "bio": string | null,
  "yearsOfExperience": number | null,
  "experienceLevel": "beginner" | "intermediate" | "advanced" | "expert" | null,
  "skills": [
    {
      "name": string,
      "category": "programming_language" | "framework" | "library" | "tool" | "database" | "cloud" | "devops" | "design" | "soft_skill" | "other"
    }
  ],
  "workExperience": [
    {
      "company": string,
      "position": string,
      "startDate": string,
      "endDate": string | null,
      "isCurrent": boolean,
      "description": string,
      "responsibilities": string[],
      "technologies": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "startDate": string | null,
      "endDate": string | null,
      "grade": string | null,
      "description": string | null
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "technologies": string[],
      "role": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "url": string | null,
      "githubUrl": string | null,
      "highlights": string[]
    }
  ],
  "interests": string[],
  "preferredProjectTypes": ("web_development" | "mobile_development" | "backend" | "frontend" | "full_stack" | "data_science" | "machine_learning" | "devops" | "cloud" | "database" | "security" | "game_development" | "blockchain" | "iot" | "desktop" | "library" | "cli_tool" | "other")[],
  "confidence": number
}

SKILL CATEGORIZATION GUIDELINES:
- programming_language: JavaScript, Python, Java, C++, TypeScript, Go, Rust, Ruby, PHP, Swift, Kotlin, C#, Scala, R, etc.
- framework: React, Vue, Angular, Next.js, Django, Flask, Spring Boot, Express, FastAPI, NestJS, Laravel, Rails, etc.
- library: Redux, jQuery, Pandas, NumPy, Lodash, Axios, etc.
- tool: Git, Docker, Webpack, Vite, Babel, ESLint, Prettier, VS Code, Postman, etc.
- database: MySQL, PostgreSQL, MongoDB, Redis, DynamoDB, Cassandra, SQLite, Firebase, etc.
- cloud: AWS, Azure, GCP, Heroku, Vercel, Netlify, DigitalOcean, etc.
- devops: Kubernetes, Jenkins, GitLab CI, GitHub Actions, Terraform, Ansible, CircleCI, etc.
- design: Figma, Adobe XD, Sketch, Photoshop, Illustrator, etc.
- soft_skill: Leadership, Communication, Problem Solving, Team Collaboration, Agile, Scrum, etc.

EXPERIENCE LEVEL INFERENCE:
- beginner: 0-2 years of experience, junior roles, student projects
- intermediate: 2-5 years of experience, mid-level roles
- advanced: 5-10 years of experience, senior roles, lead positions
- expert: 10+ years of experience, principal/staff engineer, architect roles

PROJECT TYPE INFERENCE (based on technologies and descriptions):
- web_development: HTML, CSS, JavaScript, React, Vue, Angular, web applications
- mobile_development: React Native, Flutter, Swift, Kotlin, iOS, Android
- backend: Node.js, Python, Java, APIs, microservices, server-side
- frontend: React, Vue, Angular, CSS, responsive design
- full_stack: Both frontend and backend technologies
- data_science: Python, R, data analysis, statistics, visualization
- machine_learning: TensorFlow, PyTorch, scikit-learn, ML models, AI
- devops: Docker, Kubernetes, CI/CD, infrastructure
- cloud: AWS, Azure, GCP, cloud architecture
- database: Database design, SQL, NoSQL, data modeling
- security: Cybersecurity, penetration testing, encryption
- game_development: Unity, Unreal, game engines
- blockchain: Solidity, Web3, smart contracts, cryptocurrency
- iot: Arduino, Raspberry Pi, embedded systems, sensors
- desktop: Electron, Qt, desktop applications
- library: NPM packages, PyPI packages, reusable code
- cli_tool: Command-line tools, terminal applications

DATE EXTRACTION:
- Use YYYY-MM format for all dates
- If only year is mentioned, use YYYY-01
- For current positions, set endDate to null and isCurrent to true
- Handle variations: "Jan 2020", "January 2020", "2020", "2020-2021", "Present", "Current"

CONFIDENCE SCORE (0-100):
- 90-100: All major sections found (name, contact, experience, education, skills)
- 70-89: Most sections found, some missing or incomplete
- 50-69: Basic information found, many sections missing
- Below 50: Very limited information extracted

EXAMPLE 1 - Full Stack Developer Resume:
Input: "John Doe | john@example.com | (555) 123-4567 | github.com/johndoe
Full Stack Developer with 5 years of experience building scalable web applications.

EXPERIENCE
Senior Software Engineer | Tech Corp | Jan 2021 - Present
- Led development of microservices architecture using Node.js and React
- Implemented CI/CD pipelines with GitHub Actions and Docker
- Managed PostgreSQL database with 10M+ records
- Technologies: TypeScript, React, Node.js, PostgreSQL, Docker, AWS

Software Developer | StartupXYZ | Jun 2019 - Dec 2020
- Built e-commerce platform frontend using React and Redux
- Integrated payment systems (Stripe, PayPal)
- Technologies: JavaScript, React, Redux, Express

EDUCATION
Bachelor of Science in Computer Science | MIT | 2015 - 2019
GPA: 3.8/4.0

SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, Express, Next.js, Django
Tools: Git, Docker, Kubernetes, AWS, MongoDB, PostgreSQL

PROJECTS
Personal Finance Tracker | 2020
Full-stack web app for tracking expenses and budgets
Technologies: React, Node.js, MongoDB, Chart.js
GitHub: github.com/johndoe/finance-tracker"

Response:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "location": null,
  "portfolio": null,
  "github": "github.com/johndoe",
  "linkedin": null,
  "headline": "Full Stack Developer",
  "bio": "Full Stack Developer with 5 years of experience building scalable web applications",
  "yearsOfExperience": 5,
  "experienceLevel": "advanced",
  "skills": [
    { "name": "JavaScript", "category": "programming_language" },
    { "name": "TypeScript", "category": "programming_language" },
    { "name": "Python", "category": "programming_language" },
    { "name": "SQL", "category": "programming_language" },
    { "name": "React", "category": "framework" },
    { "name": "Node.js", "category": "framework" },
    { "name": "Express", "category": "framework" },
    { "name": "Next.js", "category": "framework" },
    { "name": "Django", "category": "framework" },
    { "name": "Redux", "category": "library" },
    { "name": "Git", "category": "tool" },
    { "name": "Docker", "category": "devops" },
    { "name": "Kubernetes", "category": "devops" },
    { "name": "GitHub Actions", "category": "devops" },
    { "name": "AWS", "category": "cloud" },
    { "name": "MongoDB", "category": "database" },
    { "name": "PostgreSQL", "category": "database" }
  ],
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "startDate": "2021-01",
      "endDate": null,
      "isCurrent": true,
      "description": "Led development of microservices architecture and implemented CI/CD pipelines",
      "responsibilities": [
        "Led development of microservices architecture using Node.js and React",
        "Implemented CI/CD pipelines with GitHub Actions and Docker",
        "Managed PostgreSQL database with 10M+ records"
      ],
      "technologies": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"]
    },
    {
      "company": "StartupXYZ",
      "position": "Software Developer",
      "startDate": "2019-06",
      "endDate": "2020-12",
      "isCurrent": false,
      "description": "Built e-commerce platform frontend and integrated payment systems",
      "responsibilities": [
        "Built e-commerce platform frontend using React and Redux",
        "Integrated payment systems (Stripe, PayPal)"
      ],
      "technologies": ["JavaScript", "React", "Redux", "Express"]
    }
  ],
  "education": [
    {
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2015-01",
      "endDate": "2019-01",
      "grade": "3.8/4.0",
      "description": null
    }
  ],
  "projects": [
    {
      "name": "Personal Finance Tracker",
      "description": "Full-stack web app for tracking expenses and budgets",
      "technologies": ["React", "Node.js", "MongoDB", "Chart.js"],
      "role": null,
      "startDate": "2020-01",
      "endDate": null,
      "url": null,
      "githubUrl": "github.com/johndoe/finance-tracker",
      "highlights": [
        "Full-stack web application",
        "Expense and budget tracking functionality"
      ]
    }
  ],
  "interests": ["web development", "microservices", "cloud computing"],
  "preferredProjectTypes": ["full_stack", "backend", "web_development", "cloud"],
  "confidence": 95
}

IMPORTANT NOTES:
- Extract ALL technologies mentioned throughout the resume
- Combine similar skills (e.g., "React.js" and "ReactJS" should be "React")
- Calculate total years of experience from work history
- Infer interests from project types and technologies used
- For current positions, always set isCurrent to true and endDate to null
- Extract GitHub URLs carefully - they might be in different formats
- If a section is completely missing, return empty array [] for arrays or null for single values

Now parse the following resume:`;

const SkillSchema = z.object({
  name: z.string(),
  category: z.enum([
    "programming_language",
    "framework",
    "library",
    "tool",
    "database",
    "cloud",
    "devops",
    "design",
    "soft_skill",
    "other",
  ]),
});

const WorkExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  description: z.string(),
  responsibilities: z.array(z.string()),
  technologies: z.array(z.string()),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  grade: z.string().nullable(),
  description: z.string().nullable(),
});

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  role: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  url: z.string().nullable(),
  githubUrl: z.string().nullable(),
  highlights: z.array(z.string()),
});

const ResumeParseResultSchema = z.object({
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  portfolio: z.string().nullable(),
  github: z.string().nullable(),
  linkedin: z.string().nullable(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  yearsOfExperience: z.number().nullable(),
  experienceLevel: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .nullable(),
  skills: z.array(SkillSchema),
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  interests: z.array(z.string()),
  preferredProjectTypes: z.array(
    z.enum([
      "web_development",
      "mobile_development",
      "backend",
      "frontend",
      "full_stack",
      "data_science",
      "machine_learning",
      "devops",
      "cloud",
      "database",
      "security",
      "game_development",
      "blockchain",
      "iot",
      "desktop",
      "library",
      "cli_tool",
      "other",
    ]),
  ),
  confidence: z.number().min(0).max(100),
});

export const resumeParserRouter = createTRPCRouter({
  parseResume: publicProcedure
    .input(
      z.object({
        resumeText: z.string().min(50), // Minimum 50 characters
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        });

        const result = await model.generateContent(
          `${RESUME_PARSE_PROMPT}\n\nResume Text:\n${input.resumeText}`,
        );

        const response = result.response;
        const text = response.text();

        let parsedData;
        try {
          const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          const parsed = JSON.parse(cleanedText) as z.infer<
            typeof ResumeParseResultSchema
          >;
          parsedData = ResumeParseResultSchema.parse(parsed);
        } catch (error) {
          console.error("Failed to parse Gemini response:");
          console.error("Raw text:", text);
          console.error("Error:", error);
          throw new Error("Failed to parse AI response");
        }

        // Calculate warnings based on missing data
        const warnings: string[] = [];
        if (!parsedData.fullName) warnings.push("Name not found");
        if (!parsedData.email) warnings.push("Email not found");
        if (parsedData.skills.length === 0) warnings.push("No skills found");
        if (parsedData.workExperience.length === 0)
          warnings.push("No work experience found");
        if (parsedData.education.length === 0)
          warnings.push("No education found");

        const extractedSections = {
          personalInfo:
            !!parsedData.fullName || !!parsedData.email || !!parsedData.phone,
          skills: parsedData.skills.length > 0,
          experience: parsedData.workExperience.length > 0,
          education: parsedData.education.length > 0,
          projects: parsedData.projects.length > 0,
        };

        return {
          profile: {
            ...parsedData,
            resumeFileName: input.fileName,
            resumeUploadedAt: Date.now(),
            resumeParsedAt: Date.now(),
            isComplete: parsedData.confidence >= 70,
            lastUpdatedAt: Date.now(),
            createdAt: Date.now(),
            source: "resume" as const,
          },
          confidence: parsedData.confidence,
          warnings,
          extractedSections,
        };
      } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error("Failed to parse resume");
      }
    }),
});
