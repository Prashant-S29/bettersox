import type { Pattern } from "~/types";

export const platformPatterns: Pattern[] = [
  {
    regex: /\bandroid\b/gi,
    category: "language",
    valueExtractor: () => "Android",
  },
  {
    regex: /\bios\b/gi,
    category: "language",
    valueExtractor: () => "iOS",
  },
  {
    regex: /\bmobile\b/gi,
    category: "language",
    valueExtractor: () => "Mobile",
  },
  {
    regex: /\bweb\b/gi,
    category: "language",
    valueExtractor: () => "Web",
  },
  {
    regex: /\bdesktop\b/gi,
    category: "language",
    valueExtractor: () => "Desktop",
  },
  {
    regex: /\bbackend\b/gi,
    category: "language",
    valueExtractor: () => "Backend",
  },
  {
    regex: /\bfrontend\b/gi,
    category: "language",
    valueExtractor: () => "Frontend",
  },
  {
    regex: /\bfull-stack|fullstack\b/gi,
    category: "language",
    valueExtractor: () => "Full-stack",
  },
];

export const languagePatterns: Pattern[] = [
  {
    regex: /\b(?:javascript|js)\b/gi,
    category: "language",
    valueExtractor: () => "JavaScript",
  },
  {
    regex: /\b(?:typescript|ts)\b/gi,
    category: "language",
    valueExtractor: () => "TypeScript",
  },
  {
    regex: /\b(?:python|py)\b/gi,
    category: "language",
    valueExtractor: () => "Python",
  },
  {
    regex: /\bjava\b(?!script)/gi,
    category: "language",
    valueExtractor: () => "Java",
  },
  {
    regex: /\b(?:c\+\+|cpp|cplusplus)\b/gi,
    category: "language",
    valueExtractor: () => "C++",
  },
  {
    regex: /\bc#|csharp\b/gi,
    category: "language",
    valueExtractor: () => "C#",
  },
  {
    regex: /\b(?:golang|go)\b/gi,
    category: "language",
    valueExtractor: () => "Go",
  },
  { regex: /\brust\b/gi, category: "language", valueExtractor: () => "Rust" },
  { regex: /\bruby\b/gi, category: "language", valueExtractor: () => "Ruby" },
  { regex: /\bphp\b/gi, category: "language", valueExtractor: () => "PHP" },
  { regex: /\bswift\b/gi, category: "language", valueExtractor: () => "Swift" },
  {
    regex: /\bkotlin\b/gi,
    category: "language",
    valueExtractor: () => "Kotlin",
  },
  { regex: /\bscala\b/gi, category: "language", valueExtractor: () => "Scala" },
  { regex: /\bdart\b/gi, category: "language", valueExtractor: () => "Dart" },
  {
    regex: /\belixir\b/gi,
    category: "language",
    valueExtractor: () => "Elixir",
  },
  {
    regex: /\berlang\b/gi,
    category: "language",
    valueExtractor: () => "Erlang",
  },
  {
    regex: /\bhaskell\b/gi,
    category: "language",
    valueExtractor: () => "Haskell",
  },
  {
    regex: /\bclojure\b/gi,
    category: "language",
    valueExtractor: () => "Clojure",
  },
  {
    regex: /\b(?:r(?:\s+lang)?|r-lang)\b/gi,
    category: "language",
    valueExtractor: () => "R",
  },
  { regex: /\bjulia\b/gi, category: "language", valueExtractor: () => "Julia" },
  { regex: /\blua\b/gi, category: "language", valueExtractor: () => "Lua" },
  { regex: /\bperl\b/gi, category: "language", valueExtractor: () => "Perl" },
  {
    regex: /\b(?:bash|shell)\b/gi,
    category: "language",
    valueExtractor: () => "Shell",
  },
  {
    regex: /\bpowershell\b/gi,
    category: "language",
    valueExtractor: () => "PowerShell",
  },
  {
    regex: /\b(?:objective-c|objc)\b/gi,
    category: "language",
    valueExtractor: () => "Objective-C",
  },
  { regex: /\bzig\b/gi, category: "language", valueExtractor: () => "Zig" },
  { regex: /\bnim\b/gi, category: "language", valueExtractor: () => "Nim" },
  {
    regex: /\bcrystal\b/gi,
    category: "language",
    valueExtractor: () => "Crystal",
  },
  { regex: /\bocaml\b/gi, category: "language", valueExtractor: () => "OCaml" },
  {
    regex: /\bf#|fsharp\b/gi,
    category: "language",
    valueExtractor: () => "F#",
  },
  {
    regex: /\bgroovy\b/gi,
    category: "language",
    valueExtractor: () => "Groovy",
  },
  {
    regex: /\bmatlab\b/gi,
    category: "language",
    valueExtractor: () => "MATLAB",
  },
  {
    regex: /\bsolidity\b/gi,
    category: "language",
    valueExtractor: () => "Solidity",
  },
  {
    regex: /\b(?:c\b|c-lang)\b(?![\+#])/gi,
    category: "language",
    valueExtractor: () => "C",
  },
  {
    regex: /\bvb\.net|visual\s+basic\b/gi,
    category: "language",
    valueExtractor: () => "Visual Basic",
  },
  {
    regex: /\bfortran\b/gi,
    category: "language",
    valueExtractor: () => "Fortran",
  },
  { regex: /\bcobol\b/gi, category: "language", valueExtractor: () => "COBOL" },
  { regex: /\blisp\b/gi, category: "language", valueExtractor: () => "Lisp" },
  {
    regex: /\bscheme\b/gi,
    category: "language",
    valueExtractor: () => "Scheme",
  },
  {
    regex: /\bracket\b/gi,
    category: "language",
    valueExtractor: () => "Racket",
  },
  {
    regex: /\b(?:assembly|asm)\b/gi,
    category: "language",
    valueExtractor: () => "Assembly",
  },
  {
    regex: /\bverilog\b/gi,
    category: "language",
    valueExtractor: () => "Verilog",
  },
  { regex: /\bvhdl\b/gi, category: "language", valueExtractor: () => "VHDL" },
  { regex: /\bada\b/gi, category: "language", valueExtractor: () => "Ada" },
  {
    regex: /\bprolog\b/gi,
    category: "language",
    valueExtractor: () => "Prolog",
  },
  {
    regex: /\bsmalltalk\b/gi,
    category: "language",
    valueExtractor: () => "Smalltalk",
  },
  { regex: /\btcl\b/gi, category: "language", valueExtractor: () => "Tcl" },
  { regex: /\bawk\b/gi, category: "language", valueExtractor: () => "AWK" },
  { regex: /\bsed\b/gi, category: "language", valueExtractor: () => "sed" },
  { regex: /\bsql\b/gi, category: "language", valueExtractor: () => "SQL" },
  {
    regex: /\bplsql|pl\/sql\b/gi,
    category: "language",
    valueExtractor: () => "PL/SQL",
  },
  {
    regex: /\bt-sql|tsql\b/gi,
    category: "language",
    valueExtractor: () => "T-SQL",
  },
  {
    regex: /\bgraphql\b/gi,
    category: "language",
    valueExtractor: () => "GraphQL",
  },
  { regex: /\bhtml\b/gi, category: "language", valueExtractor: () => "HTML" },
  { regex: /\bcss\b/gi, category: "language", valueExtractor: () => "CSS" },
  {
    regex: /\bsass|scss\b/gi,
    category: "language",
    valueExtractor: () => "Sass",
  },
  { regex: /\bless\b/gi, category: "language", valueExtractor: () => "Less" },
  { regex: /\bxml\b/gi, category: "language", valueExtractor: () => "XML" },
  { regex: /\byaml\b/gi, category: "language", valueExtractor: () => "YAML" },
  { regex: /\bjson\b/gi, category: "language", valueExtractor: () => "JSON" },
  { regex: /\btoml\b/gi, category: "language", valueExtractor: () => "TOML" },
  {
    regex: /\bmarkdown|md\b/gi,
    category: "language",
    valueExtractor: () => "Markdown",
  },
  { regex: /\blatex\b/gi, category: "language", valueExtractor: () => "LaTeX" },
  { regex: /\bvue\b/gi, category: "language", valueExtractor: () => "Vue" },
  {
    regex: /\bsvelte\b/gi,
    category: "language",
    valueExtractor: () => "Svelte",
  },
  {
    regex: /\bcoffeescript\b/gi,
    category: "language",
    valueExtractor: () => "CoffeeScript",
  },
  { regex: /\belm\b/gi, category: "language", valueExtractor: () => "Elm" },
  {
    regex: /\bpurescript\b/gi,
    category: "language",
    valueExtractor: () => "PureScript",
  },
  {
    regex: /\breason(?:ml)?\b/gi,
    category: "language",
    valueExtractor: () => "ReasonML",
  },
  {
    regex: /\brescript\b/gi,
    category: "language",
    valueExtractor: () => "ReScript",
  },
  {
    regex: /\bv(?:\s+lang|lang)?\b/gi,
    category: "language",
    valueExtractor: () => "V",
  },
  { regex: /\bodin\b/gi, category: "language", valueExtractor: () => "Odin" },
  {
    regex: /\bcarbon\b/gi,
    category: "language",
    valueExtractor: () => "Carbon",
  },
  { regex: /\bmojo\b/gi, category: "language", valueExtractor: () => "Mojo" },
  { regex: /\bgleam\b/gi, category: "language", valueExtractor: () => "Gleam" },
  { regex: /\broc\b/gi, category: "language", valueExtractor: () => "Roc" },
  { regex: /\bidris\b/gi, category: "language", valueExtractor: () => "Idris" },
  { regex: /\bagda\b/gi, category: "language", valueExtractor: () => "Agda" },
  { regex: /\bcoq\b/gi, category: "language", valueExtractor: () => "Coq" },
  { regex: /\blean\b/gi, category: "language", valueExtractor: () => "Lean" },
  {
    regex: /\bpascal\b/gi,
    category: "language",
    valueExtractor: () => "Pascal",
  },
  {
    regex: /\bdelphi\b/gi,
    category: "language",
    valueExtractor: () => "Delphi",
  },
  { regex: /\babap\b/gi, category: "language", valueExtractor: () => "ABAP" },
  { regex: /\bapex\b/gi, category: "language", valueExtractor: () => "Apex" },
  { regex: /\bhaxe\b/gi, category: "language", valueExtractor: () => "Haxe" },
  {
    regex: /\bactionscript\b/gi,
    category: "language",
    valueExtractor: () => "ActionScript",
  },
  { regex: /\bvala\b/gi, category: "language", valueExtractor: () => "Vala" },
  { regex: /\bd\b(?!art)/gi, category: "language", valueExtractor: () => "D" },
  { regex: /\bpony\b/gi, category: "language", valueExtractor: () => "Pony" },
  { regex: /\bred\b/gi, category: "language", valueExtractor: () => "Red" },
  { regex: /\brebol\b/gi, category: "language", valueExtractor: () => "Rebol" },
  { regex: /\bio\b/gi, category: "language", valueExtractor: () => "Io" },
  { regex: /\bforth\b/gi, category: "language", valueExtractor: () => "Forth" },
  {
    regex: /\bfactor\b/gi,
    category: "language",
    valueExtractor: () => "Factor",
  },
];

export const frameworkPatterns: Pattern[] = [
  {
    regex: /\b(?:react|reactjs|react\.js)\b/gi,
    category: "framework",
    valueExtractor: () => "React",
  },
  {
    regex: /\b(?:next|nextjs|next\.js)\b/gi,
    category: "framework",
    valueExtractor: () => "Next.js",
  },
  {
    regex: /\b(?:vue|vuejs|vue\.js)\b/gi,
    category: "framework",
    valueExtractor: () => "Vue",
  },
  {
    regex: /\b(?:nuxt|nuxtjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Nuxt",
  },
  {
    regex: /\b(?:angular|angularjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Angular",
  },
  {
    regex: /\b(?:svelte|sveltekit)\b/gi,
    category: "framework",
    valueExtractor: () => "Svelte",
  },
  {
    regex: /\b(?:solid|solidjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Solid",
  },
  {
    regex: /\bpreact\b/gi,
    category: "framework",
    valueExtractor: () => "Preact",
  },
  {
    regex: /\b(?:ember|emberjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Ember",
  },
  {
    regex: /\b(?:alpine|alpinejs)\b/gi,
    category: "framework",
    valueExtractor: () => "Alpine.js",
  },
  {
    regex: /\bastro\b/gi,
    category: "framework",
    valueExtractor: () => "Astro",
  },
  {
    regex: /\bremix\b/gi,
    category: "framework",
    valueExtractor: () => "Remix",
  },
  {
    regex: /\bgatsby\b/gi,
    category: "framework",
    valueExtractor: () => "Gatsby",
  },

  {
    regex: /\b(?:express|expressjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Express",
  },
  {
    regex: /\b(?:nestjs|nest\.js)\b/gi,
    category: "framework",
    valueExtractor: () => "NestJS",
  },
  {
    regex: /\b(?:koa|koajs)\b/gi,
    category: "framework",
    valueExtractor: () => "Koa",
  },
  {
    regex: /\bfastify\b/gi,
    category: "framework",
    valueExtractor: () => "Fastify",
  },
  { regex: /\bhapi\b/gi, category: "framework", valueExtractor: () => "Hapi" },
  {
    regex: /\badonisjs\b/gi,
    category: "framework",
    valueExtractor: () => "AdonisJS",
  },
  {
    regex: /\bdjango\b/gi,
    category: "framework",
    valueExtractor: () => "Django",
  },
  {
    regex: /\bflask\b/gi,
    category: "framework",
    valueExtractor: () => "Flask",
  },
  {
    regex: /\bfastapi\b/gi,
    category: "framework",
    valueExtractor: () => "FastAPI",
  },
  {
    regex: /\b(?:rails|ruby on rails)\b/gi,
    category: "framework",
    valueExtractor: () => "Rails",
  },
  {
    regex: /\bsinatra\b/gi,
    category: "framework",
    valueExtractor: () => "Sinatra",
  },
  {
    regex: /\blaravel\b/gi,
    category: "framework",
    valueExtractor: () => "Laravel",
  },
  {
    regex: /\bsymfony\b/gi,
    category: "framework",
    valueExtractor: () => "Symfony",
  },
  {
    regex: /\b(?:spring|spring boot)\b/gi,
    category: "framework",
    valueExtractor: () => "Spring",
  },
  {
    regex: /\bquarkus\b/gi,
    category: "framework",
    valueExtractor: () => "Quarkus",
  },
  {
    regex: /\b(?:dotnet|\.net|asp\.net)\b/gi,
    category: "framework",
    valueExtractor: () => ".NET",
  },
  { regex: /\bgin\b/gi, category: "framework", valueExtractor: () => "Gin" },
  { regex: /\becho\b/gi, category: "framework", valueExtractor: () => "Echo" },
  {
    regex: /\bfiber\b/gi,
    category: "framework",
    valueExtractor: () => "Fiber",
  },
  {
    regex: /\bactix\b/gi,
    category: "framework",
    valueExtractor: () => "Actix",
  },
  {
    regex: /\brocket\b/gi,
    category: "framework",
    valueExtractor: () => "Rocket",
  },
  { regex: /\baxum\b/gi, category: "framework", valueExtractor: () => "Axum" },
  {
    regex: /\bphoenix\b/gi,
    category: "framework",
    valueExtractor: () => "Phoenix",
  },

  {
    regex: /\b(?:react native|react-native)\b/gi,
    category: "framework",
    valueExtractor: () => "React Native",
  },
  {
    regex: /\bflutter\b/gi,
    category: "framework",
    valueExtractor: () => "Flutter",
  },
  {
    regex: /\bionic\b/gi,
    category: "framework",
    valueExtractor: () => "Ionic",
  },
  {
    regex: /\bxamarin\b/gi,
    category: "framework",
    valueExtractor: () => "Xamarin",
  },
  { regex: /\bexpo\b/gi, category: "framework", valueExtractor: () => "Expo" },

  {
    regex: /\b(?:electron|electronjs)\b/gi,
    category: "framework",
    valueExtractor: () => "Electron",
  },
  {
    regex: /\btauri\b/gi,
    category: "framework",
    valueExtractor: () => "Tauri",
  },
];

export const libraryPatterns: Pattern[] = [
  {
    regex: /\b(?:shadcn|shadcn\/ui|shadcn ui)\b/gi,
    category: "library",
    valueExtractor: () => "shadcn/ui",
  },
  {
    regex: /\b(?:tailwind|tailwindcss|tailwind css)\b/gi,
    category: "library",
    valueExtractor: () => "Tailwind CSS",
  },
  {
    regex: /\b(?:material ui|mui|material-ui)\b/gi,
    category: "library",
    valueExtractor: () => "Material-UI",
  },
  {
    regex: /\b(?:ant design|antd)\b/gi,
    category: "library",
    valueExtractor: () => "Ant Design",
  },
  {
    regex: /\b(?:chakra ui|chakra-ui)\b/gi,
    category: "library",
    valueExtractor: () => "Chakra UI",
  },
  {
    regex: /\bmantine\b/gi,
    category: "library",
    valueExtractor: () => "Mantine",
  },
  {
    regex: /\bbootstrap\b/gi,
    category: "library",
    valueExtractor: () => "Bootstrap",
  },
  {
    regex: /\b(?:radix ui|radix-ui)\b/gi,
    category: "library",
    valueExtractor: () => "Radix UI",
  },
  {
    regex: /\b(?:headless ui|headlessui)\b/gi,
    category: "library",
    valueExtractor: () => "Headless UI",
  },
  {
    regex: /\b(?:daisy ui|daisyui)\b/gi,
    category: "library",
    valueExtractor: () => "DaisyUI",
  },

  {
    regex: /\b(?:redux|redux toolkit)\b/gi,
    category: "library",
    valueExtractor: () => "Redux",
  },
  {
    regex: /\bzustand\b/gi,
    category: "library",
    valueExtractor: () => "Zustand",
  },
  { regex: /\bmobx\b/gi, category: "library", valueExtractor: () => "MobX" },
  {
    regex: /\brecoil\b/gi,
    category: "library",
    valueExtractor: () => "Recoil",
  },
  { regex: /\bjotai\b/gi, category: "library", valueExtractor: () => "Jotai" },
  {
    regex: /\bvaltio\b/gi,
    category: "library",
    valueExtractor: () => "Valtio",
  },
  {
    regex: /\bxstate\b/gi,
    category: "library",
    valueExtractor: () => "XState",
  },
  { regex: /\bpinia\b/gi, category: "library", valueExtractor: () => "Pinia" },
  { regex: /\bvuex\b/gi, category: "library", valueExtractor: () => "Vuex" },

  {
    regex: /\b(?:tanstack query|react query)\b/gi,
    category: "library",
    valueExtractor: () => "TanStack Query",
  },
  { regex: /\bswr\b/gi, category: "library", valueExtractor: () => "SWR" },
  { regex: /\baxios\b/gi, category: "library", valueExtractor: () => "Axios" },

  {
    regex: /\bgraphql\b/gi,
    category: "library",
    valueExtractor: () => "GraphQL",
  },
  {
    regex: /\bapollo\b/gi,
    category: "library",
    valueExtractor: () => "Apollo",
  },
  {
    regex: /\b(?:trpc|t3 stack)\b/gi,
    category: "library",
    valueExtractor: () => "tRPC",
  },
  {
    regex: /\bprisma\b/gi,
    category: "library",
    valueExtractor: () => "Prisma",
  },
  {
    regex: /\bdrizzle\b/gi,
    category: "library",
    valueExtractor: () => "Drizzle",
  },
  {
    regex: /\btypeorm\b/gi,
    category: "library",
    valueExtractor: () => "TypeORM",
  },
  {
    regex: /\bsequelize\b/gi,
    category: "library",
    valueExtractor: () => "Sequelize",
  },
  {
    regex: /\bmongoose\b/gi,
    category: "library",
    valueExtractor: () => "Mongoose",
  },

  { regex: /\bjest\b/gi, category: "library", valueExtractor: () => "Jest" },
  {
    regex: /\bvitest\b/gi,
    category: "library",
    valueExtractor: () => "Vitest",
  },
  {
    regex: /\bcypress\b/gi,
    category: "library",
    valueExtractor: () => "Cypress",
  },
  {
    regex: /\bplaywright\b/gi,
    category: "library",
    valueExtractor: () => "Playwright",
  },

  { regex: /\bvite\b/gi, category: "library", valueExtractor: () => "Vite" },
  {
    regex: /\bwebpack\b/gi,
    category: "library",
    valueExtractor: () => "Webpack",
  },
  {
    regex: /\besbuild\b/gi,
    category: "library",
    valueExtractor: () => "esbuild",
  },
  {
    regex: /\bturbopack\b/gi,
    category: "library",
    valueExtractor: () => "Turbopack",
  },

  {
    regex: /\b(?:framer motion|framer-motion)\b/gi,
    category: "library",
    valueExtractor: () => "Framer Motion",
  },
  { regex: /\bgsap\b/gi, category: "library", valueExtractor: () => "GSAP" },
  {
    regex: /\b(?:three\.js|threejs)\b/gi,
    category: "library",
    valueExtractor: () => "Three.js",
  },

  {
    regex: /\b(?:react hook form|react-hook-form)\b/gi,
    category: "library",
    valueExtractor: () => "React Hook Form",
  },
  {
    regex: /\bformik\b/gi,
    category: "library",
    valueExtractor: () => "Formik",
  },
  { regex: /\bzod\b/gi, category: "library", valueExtractor: () => "Zod" },

  {
    regex: /\b(?:next-auth|nextauth)\b/gi,
    category: "library",
    valueExtractor: () => "NextAuth",
  },
  {
    regex: /\bsupabase\b/gi,
    category: "library",
    valueExtractor: () => "Supabase",
  },
  {
    regex: /\bfirebase\b/gi,
    category: "library",
    valueExtractor: () => "Firebase",
  },
  {
    regex: /\bnodejs|node\.js\b/gi,
    category: "library",
    valueExtractor: () => "Node.js",
  },
];

export const activityPatterns: Pattern[] = [
  {
    regex:
      /\b(?:very active|highly active|actively maintained|constantly updated|daily commits)\b/gi,
    category: "activity",
    valueExtractor: () => "very_active",
  },
  {
    regex: /\b(?:active|maintained|regularly updated|weekly updates)\b/gi,
    category: "activity",
    valueExtractor: () => "active",
  },
  {
    regex:
      /\b(?:moderate activity|somewhat active|occasionally updated|monthly updates)\b/gi,
    category: "activity",
    valueExtractor: () => "moderate",
  },
  {
    regex: /\b(?:inactive|not maintained|dead|abandoned|stale)\b/gi,
    category: "activity",
    valueExtractor: () => "inactive",
  },
];

export const starsPatterns: Pattern[] = [
  {
    regex: /(\d+(?:\.\d+)?[kKmM]?\+?)\s*(?:stars?|starred)/gi,
    category: "stars",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?\+?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1].replace("+", "");
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `stars:${num}`;
    },
  },
  {
    regex: /(?:less than|under|below)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:stars?)/gi,
    category: "stars",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `maxStars:${num}`;
    },
  },
  {
    regex: /(?:more than|over|above)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:stars?)/gi,
    category: "stars",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `minStars:${num}`;
    },
  },
  {
    regex:
      /(?:around|approximately|roughly|about|~)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:stars?)/gi,
    category: "stars",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `stars:${num}`;
    },
  },
];

export const contributorsPatterns: Pattern[] = [
  {
    regex:
      /\b(?:low|few|small|less|limited)\s+(?:competition|contributors?)\b/gi,
    category: "contributors",
    valueExtractor: () => "low",
  },
  {
    regex: /\b(?:medium|moderate|average)\s+(?:competition|contributors?)\b/gi,
    category: "contributors",
    valueExtractor: () => "medium",
  },
  {
    regex: /\b(?:high|many|large|lots of)\s+(?:competition|contributors?)\b/gi,
    category: "contributors",
    valueExtractor: () => "high",
  },
  {
    regex: /(\d+(?:\.\d+)?[kKmM]?\+?)\s*(?:contributors?|maintainers?)/gi,
    category: "contributors",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?\+?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1].replace("+", "");
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `contributors:${num}`;
    },
  },
  {
    regex:
      /(?:less than|under|below)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:contributors?)/gi,
    category: "contributors",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `maxContributors:${num}`;
    },
  },
  {
    regex:
      /(?:more than|over|above)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:contributors?)/gi,
    category: "contributors",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `minContributors:${num}`;
    },
  },
  {
    regex:
      /(?:around|approximately|roughly|about|~)\s*(\d+(?:\.\d+)?[kKmM]?)\s*(?:contributors?)/gi,
    category: "contributors",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?)/.exec(match);
      if (!numMatch?.[1]) return "";

      let numStr = numMatch[1];
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `contributors:${num}`;
    },
  },
];

export const issuePatterns: Pattern[] = [
  {
    regex:
      /\b(?:good first issues?|beginner friendly|easy to contribute|first-timers|starter issues?|good-first-issues?)\b/gi,
    category: "issue",
    valueExtractor: () => "good-first-issue",
  },
  {
    regex:
      /\b(?:help wanted|looking for contributors|needs help|help-wanted)\b/gi,
    category: "issue",
    valueExtractor: () => "help-wanted",
  },
  {
    regex: /\b(?:bugs?|bug fixes?|bugfix)\b/gi,
    category: "issue",
    valueExtractor: () => "bug",
  },
  {
    regex: /\b(?:documentation|docs?)\b/gi,
    category: "issue",
    valueExtractor: () => "documentation",
  },
  {
    regex: /\b(?:enhancement|feature requests?|improvements?)\b/gi,
    category: "issue",
    valueExtractor: () => "enhancement",
  },
  {
    regex:
      /(?:around|approximately|roughly|about|~)?\s*(\d+(?:\.\d+)?[kKmM]?\+?)\s*issues?\b/gi,
    category: "issue",
    valueExtractor: (match) => {
      const numMatch = /(\d+(?:\.\d+)?[kKmM]?\+?)/.exec(match);
      if (!numMatch?.[1]) return "issues";

      let numStr = numMatch[1].replace("+", "");
      let multiplier = 1;

      if (/[kK]$/.exec(numStr)) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (/[mM]$/.exec(numStr)) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      }

      const num = Math.floor(parseFloat(numStr) * multiplier);
      return `issues:${num}`;
    },
  },
];

export const allPatterns: Pattern[] = [
  ...languagePatterns,
  ...frameworkPatterns,
  ...libraryPatterns,
  ...platformPatterns,
  ...activityPatterns,
  ...issuePatterns,
  ...starsPatterns,
  ...contributorsPatterns,
];
