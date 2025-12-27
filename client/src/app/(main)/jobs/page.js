"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import JobListingComponent from "@/components/smoothui/job-listing-component";
import { Search, ChevronDown } from "lucide-react";
import { Badge2 } from "@/components/ui/badge2";
import { ChevronDownIcon } from "@/components/ui/chevron-down";

// Company logo component using logo.dev
const companyDomains = {
    "EliseAI": "elise.ai",
    "Chainguard": "chainguard.dev",
    "Kaizen": "kaizen.io",
    "Symbolica": "symbolica.ai",
    "Imprint": "imprint.co",
    "Firsthand": "firsthand.co",
    "Clear Street": "clearstreet.io",
    "Adaptive ML": "adaptiveml.ai",
    "doInstruct": "doinstruct.com",
    "Mistral": "mistral.ai",
    "Monumental": "monumental.ai",
    "Langchain": "langchain.com",
    "Nuro": "nuro.ai",
    "Anthropic": "anthropic.com",
    "Stripe": "stripe.com",
    "Figma": "figma.com",
    "Ramp": "ramp.com",
    "Vercel": "vercel.com",
    "Linear": "linear.app",
    "Retool": "retool.com",
};

const CompanyLogo = ({ name }) => {
    const domain = companyDomains[name] || `${name.toLowerCase().replace(/\s+/g, '')}.com`;

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border overflow-hidden p-1">
            <img
                src={`https://img.logo.dev/${domain}?token=live_6a1a28fd-6420-4492-aeb0-b297461d9de2`}
                alt={`${name} logo`}
                className="h-full w-full object-contain"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
            <span className="text-sm font-semibold text-foreground hidden items-center justify-center h-full w-full">
                {name.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};

// Realistic demo job data with comprehensive descriptions
const sampleJobs = [
    {
        id: 1,
        company: "EliseAI",
        title: "Strategy and Operations, Senior Associate | Healthcare",
        logo: <CompanyLogo name="EliseAI" />,
        job_description: `About EliseAI
EliseAI is an AI-powered communication platform that automates conversations for the real estate and healthcare industries. We're backed by top-tier investors and are on a mission to revolutionize how businesses communicate with their customers through intelligent automation.

About the Role
We're looking for a Senior Associate to join our Strategy & Operations team focused on our Healthcare vertical. You'll work directly with leadership to drive strategic initiatives, analyze market opportunities, and optimize our go-to-market approach. This role offers significant exposure to executive decision-making and the opportunity to shape the future of AI in healthcare.

Key Responsibilities
• Develop business cases and strategic recommendations for new market opportunities
• Conduct competitive analysis and market research to inform product and GTM strategy
• Partner cross-functionally with Product, Sales, and Engineering teams
• Build and maintain financial models to track key business metrics
• Lead special projects from conception to implementation

About You
• 4-6 years of experience in consulting, investment banking, or high-growth startups
• Strong analytical skills with proficiency in Excel/Sheets and SQL
• Excellent written and verbal communication skills
• Ability to thrive in a fast-paced, ambiguous environment
• Bachelor's degree required; MBA is a plus`,
        salary: "$130k - $170k",
        location: "New York City",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 2,
        company: "Chainguard",
        title: "Director of Solutions Marketing",
        logo: <CompanyLogo name="Chainguard" />,
        job_description: `About Chainguard
Chainguard is the secure foundation for software development, providing hardened container images and tools that help organizations ship secure software faster. Founded by industry veterans from Google, we're backed by Sequoia and are trusted by the world's most security-conscious organizations.

About the Role
We're seeking a Director of Solutions Marketing to lead our go-to-market strategy for enterprise security solutions. You'll own the messaging, positioning, and content strategy for our entire product portfolio, translating complex security capabilities into compelling value propositions that resonate with CISOs and DevSecOps teams.

Key Responsibilities
• Define and execute solutions marketing strategy across all product lines
• Create compelling content including whitepapers, case studies, and competitive battlecards
• Partner with Product Marketing and Sales Enablement to drive pipeline
• Develop messaging frameworks that communicate technical value to security leaders
• Lead analyst relations and maintain industry thought leadership

About You
• 8+ years of B2B marketing experience, with 5+ years in security or infrastructure
• Deep understanding of cloud-native security, containers, and the software supply chain
• Proven track record of creating content that drives pipeline and revenue
• Strong storytelling abilities with experience presenting to executive audiences
• Ability to translate complex technical concepts into business value`,
        salary: "$180k - $220k",
        location: "United States",
        remote: "Yes",
        job_time: "Full-time",
    },
    {
        id: 3,
        company: "Kaizen",
        title: "GTM Recruiter",
        logo: <CompanyLogo name="Kaizen" />,
        job_description: `About Kaizen
Kaizen is a rapidly growing fintech startup transforming how businesses manage their finances. We've raised $50M+ from top VCs and are scaling our team to meet unprecedented demand. Our culture values continuous improvement, hence our name.

About the Role
Join Kaizen as a GTM Recruiter and help us build world-class sales, marketing, and customer success teams. You'll own full-cycle recruiting for revenue-generating roles, from sourcing to close, and play a critical role in scaling our go-to-market organization.

Key Responsibilities
• Own full-cycle recruiting for Sales, Marketing, SDR, and Customer Success roles
• Partner with hiring managers to define role requirements and interview processes
• Source passive candidates through LinkedIn, events, and creative channels
• Manage candidate experience from first touch to offer acceptance
• Track and report on recruiting metrics to optimize the hiring funnel

About You
• 3+ years of full-cycle recruiting experience in fast-paced tech environments
• Track record of hiring for GTM roles at high-growth startups
• Strong sourcing skills and experience with LinkedIn Recruiter
• Excellent communication and relationship-building abilities
• Passion for creating an inclusive, candidate-first hiring experience`,
        salary: "$90k - $130k",
        location: "New York, NY",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 4,
        company: "Symbolica",
        title: "Talent Sourcer – AI & ML Research",
        logo: <CompanyLogo name="Symbolica" />,
        job_description: `About Symbolica
Symbolica is a stealth AI research company building breakthrough technology in symbolic reasoning and AI safety. Founded by world-renowned researchers, we're tackling some of the hardest problems in AI. Our team includes PhDs from MIT, Stanford, and DeepMind.

About the Role
We need a specialized Talent Sourcer to help us find world-class AI/ML researchers. You'll source PhD-level candidates from top universities and research labs globally, engaging passive candidates and building relationships within the academic community.

Key Responsibilities
• Source and engage PhD-level candidates in ML, AI, and related fields
• Build relationships with university professors and research lab leaders
• Develop creative sourcing strategies for hard-to-reach research talent
• Manage candidate pipelines and ATS hygiene
• Partner with recruiters and hiring managers on search priorities

About You
• 2+ years of sourcing experience, preferably for technical research roles
• Familiarity with the AI/ML research landscape and key institutions
• Comfortable discussing technical concepts with researchers
• Excellent written communication for personalized outreach
• Experience with sourcing tools like LinkedIn Recruiter, SeekOut, or Entelo`,
        salary: "$100k - $140k",
        location: "London, UK",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 5,
        company: "Imprint",
        title: "Senior Engineering Manager - Spend",
        logo: <CompanyLogo name="Imprint" />,
        job_description: `About Imprint
Imprint partners with iconic brands to deliver modern credit card programs. We've raised over $100M and are partnered with companies like H-E-B, Turkish Airlines, and Westinghouse. Our engineering team builds the infrastructure that powers billions in transactions.

About the Role
We're hiring a Senior Engineering Manager to lead our Spend engineering team. You'll manage 8-12 engineers building next-generation payment infrastructure, driving technical strategy while mentoring the next generation of engineering leaders.

Key Responsibilities
• Lead a team of 8-12 engineers building payment authorization and settlement systems
• Drive technical roadmap and architecture decisions for the Spend domain
• Partner with Product to define and prioritize features
• Hire, mentor, and develop senior engineers and tech leads
• Ensure system reliability, scalability, and security for financial infrastructure

About You
• 5+ years of engineering management experience
• Strong technical background in payments, fintech, or distributed systems
• Track record of scaling teams from 5 to 15+ engineers
• Experience with high-availability systems processing financial transactions
• Bachelor's or Master's in Computer Science or equivalent experience
• Excellent communication skills for cross-functional collaboration`,
        salary: "$220k - $280k",
        location: "San Francisco",
        remote: "No",
        job_time: "Full-time",
    },
    {
        id: 6,
        company: "Firsthand",
        title: "Director, Channel Operations",
        logo: <CompanyLogo name="Firsthand" />,
        job_description: `About Firsthand
Firsthand is an AI-powered career intelligence platform helping students discover and launch their careers. We partner with universities and employers to provide personalized career guidance at scale. Backed by top education-focused investors.

About the Role
We're seeking a Director of Channel Operations to build and optimize our partner ecosystem. You'll design partner programs, manage channel relationships, and develop operational frameworks to scale our indirect sales motion.

Key Responsibilities
• Build and manage relationships with channel partners including universities and career services
• Design partner programs including onboarding, enablement, and incentives
• Develop operational processes to scale partner management
• Track and report on channel performance metrics
• Work cross-functionally with Sales, Marketing, and Product teams

About You
• 7+ years of experience in channel management, partnerships, or business development
• Experience building partner programs from the ground up
• Strong analytical skills with experience tracking partner metrics
• Excellent relationship management and negotiation abilities
• Experience in EdTech or B2B SaaS preferred`,
        salary: "$160k - $200k",
        location: "New York",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 7,
        company: "Clear Street",
        title: "Product Manager - Trading Platform",
        logo: <CompanyLogo name="Clear Street" />,
        job_description: `About Clear Street
Clear Street is a cloud-native prime brokerage building modern infrastructure for capital markets. We're replacing legacy systems with technology that makes trading more accessible and efficient. Backed by Prysm Capital and valued at over $2B.

About the Role
We're looking for a Product Manager to drive our trading platform roadmap. You'll work at the intersection of finance and technology, defining product requirements for hedge funds and institutional investors.

Key Responsibilities
• Define product vision and roadmap for trading platform features
• Gather requirements from hedge funds, asset managers, and internal stakeholders
• Write detailed product specs and work closely with engineering
• Analyze user behavior and trading patterns to inform product decisions
• Partner with design to create intuitive interfaces for complex workflows

About You
• 4-6 years of product management experience
• Background in fintech, capital markets, or trading technology
• Strong technical acumen and ability to work with engineering teams
• Understanding of trading workflows, order management, and market structure
• Excellent analytical and communication skills
• Series 7/63 is a plus but not required`,
        salary: "$180k - $240k",
        location: "New York, NY",
        remote: "No",
        job_time: "Full-time",
    },
    {
        id: 8,
        company: "Adaptive ML",
        title: "Business Operations - Systems & Automation",
        logo: <CompanyLogo name="Adaptive ML" />,
        job_description: `About Adaptive ML
Adaptive ML is building the next generation of AI training infrastructure. Our platform enables companies to fine-tune and deploy large language models efficiently. Founded by ex-Google and Anthropic researchers, we're backed by a]16z.

About the Role
Join Adaptive ML to build and automate our internal systems and processes. You'll identify operational bottlenecks, implement automation solutions, and drive efficiency improvements across the company.

Key Responsibilities
• Identify and map current business processes across teams
• Implement automation using tools like Zapier, Make, and custom scripts
• Build dashboards and reporting in Notion, Airtable, or similar tools
• Document processes and train team members on new systems
• Partner with Engineering on internal tool requirements

About You
• 3-5 years of operations or business systems experience
• Proficiency with automation tools (Zapier, Make, n8n)
• SQL knowledge for data extraction and analysis
• Strong problem-solving skills and attention to detail
• Experience in fast-paced startup environments
• Bonus: Python scripting for custom automations`,
        salary: "$100k - $140k",
        location: "New York / Paris",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 9,
        company: "doInstruct",
        title: "Senior Account Executive - USA",
        logo: <CompanyLogo name="doInstruct" />,
        job_description: `About doInstruct
doInstruct is a leading learning experience platform that transforms how enterprises train their workforce. Our AI-powered platform creates personalized learning paths and measures skill development. We serve Fortune 500 companies across industries.

About the Role
We're hiring a Senior Account Executive to drive enterprise sales across the US East Coast. You'll own the full sales cycle from prospecting to close, managing complex multi-stakeholder deals with L&D and HR leaders.

Key Responsibilities
• Own full sales cycle for enterprise accounts ($100k+ ACV)
• Prospect and generate pipeline through outbound and inbound channels
• Conduct discovery calls and product demonstrations
• Navigate complex buying committees including HR, L&D, and IT
• Negotiate contracts and close deals
• Maintain accurate forecasting in Salesforce

About You
• 5+ years of B2B SaaS sales experience
• Consistent track record of exceeding quota (top 10-20% performer)
• Experience selling to enterprise HR/L&D buyers
• Strong presentation and negotiation skills
• Familiarity with MEDDIC or similar sales methodologies
• Based on US East Coast with ability to travel 25%`,
        salary: "$120k - $180k OTE",
        location: "Remote US East Coast",
        remote: "Yes",
        job_time: "Full-time",
    },
    {
        id: 10,
        company: "Mistral",
        title: "Research Engineer - Language Models",
        logo: <CompanyLogo name="Mistral" />,
        job_description: `About Mistral
Mistral AI is a French AI company building state-of-the-art large language models. Founded by former DeepMind and Meta AI researchers, we're one of Europe's most valuable AI startups with models that rival GPT-4 in capability.

About the Role
We're seeking a Research Engineer to push the boundaries of language model capabilities. You'll work on pre-training, fine-tuning, and evaluating large-scale models alongside world-class researchers.

Key Responsibilities
• Implement and train large language models at scale
• Design and run experiments to improve model capabilities
• Develop evaluation frameworks and benchmarks
• Optimize training infrastructure for efficiency
• Collaborate with researchers on paper publications

About You
• MS or PhD in Computer Science, Machine Learning, or related field
• Strong programming skills in Python and PyTorch
• Experience training models at scale (10B+ parameters preferred)
• Understanding of transformer architectures and training dynamics
• Strong mathematical foundations in ML and statistics
• Publications at top ML venues (NeurIPS, ICML, ICLR) is a plus`,
        salary: "€80k - €150k",
        location: "Paris",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 11,
        company: "Monumental",
        title: "Software Engineer, Full-Stack",
        logo: <CompanyLogo name="Monumental" />,
        job_description: `About Monumental
Monumental is building autonomous construction robots that transform how buildings are made. Our robots lay bricks, install facades, and perform precision tasks faster and safer than traditional methods. Backed by Obvious Ventures and operating across Europe.

About the Role
We need a Full-Stack Engineer to develop our web platform that controls and monitors autonomous construction robots. You'll work on React frontends, Node.js backends, and integrate with our robotics systems.

Key Responsibilities
• Build and maintain web applications for robot fleet management
• Develop real-time monitoring dashboards using WebSockets
• Create APIs for integration with robotics control systems
• Implement authentication, authorization, and audit logging
• Collaborate with robotics engineers on data formats and protocols

About You
• 3-5 years of full-stack development experience
• Proficiency in React/TypeScript and Node.js
• Experience with real-time systems and WebSocket communication
• Familiarity with PostgreSQL and Redis
• Interest in robotics, manufacturing, or construction tech
• Experience with IoT or hardware integration is a plus`,
        salary: "$130k - $175k",
        location: "Amsterdam",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 12,
        company: "Langchain",
        title: "Solutions Architect",
        logo: <CompanyLogo name="Langchain" />,
        job_description: `About Langchain
LangChain is the leading framework for building LLM-powered applications. Our open-source tools are used by millions of developers, and our enterprise platform, LangSmith, helps teams deploy and monitor production AI applications.

About the Role
We're hiring a Solutions Architect to help enterprise customers implement LLM applications using our platform. You'll design architectures, build proof-of-concepts, and guide technical implementations.

Key Responsibilities
• Design LLM application architectures for enterprise customers
• Build proof-of-concepts demonstrating LangChain and LangSmith capabilities
• Provide technical guidance during enterprise sales cycles
• Create technical content including guides, tutorials, and reference architectures
• Gather customer feedback to inform product roadmap
• Speak at conferences and represent LangChain technically

About You
• 5+ years of solutions architecture or software engineering experience
• Deep knowledge of LLMs, RAG patterns, and AI/ML concepts
• Strong Python skills and experience with LangChain
• Experience with vector databases (Pinecone, Weaviate, Chroma)
• Excellent customer-facing and presentation skills
• Background with cloud platforms (AWS, GCP, Azure)`,
        salary: "$160k - $210k",
        location: "United States",
        remote: "Yes",
        job_time: "Full-time",
    },
    {
        id: 13,
        company: "Nuro",
        title: "Senior Software Engineer, Engineering Productivity",
        logo: <CompanyLogo name="Nuro" />,
        job_description: `About Nuro
Nuro is a self-driving technology company on a mission to make autonomy accessible to all. Founded in 2016, Nuro is building the world's most scalable driver, combining cutting-edge AI with automotive-grade hardware. Our technology powers robotaxis, commercial fleets, and personally owned vehicles.

About the Team
The Engineering Productivity team's mission is to empower engineers to build the future of transportation by providing them with the tools and infrastructure they need to be productive and successful.

About the Role
Collaborate with engineers across Nuro to identify pain points in the engineering process. Define, instrument, analyze, communicate, and monitor batch/stream metrics related to engineering velocity and system health.

Key Responsibilities
• Identify and address pain points in the engineering process
• Build scalable CI/CD infrastructure that continuously merges, builds, tests, and releases code
• Create new internal tools and extend existing ones to improve developer efficiency
• Own and improve fundamental libraries and APIs for complex systems
• Leverage Generative AI to boost engineering productivity
• Educate developers on best practices and new tools

About You
• Inefficiency bothers you - you love making frustrating processes elegant
• Strong software engineering skills in C++, Python, or Golang
• Experience with build frameworks such as Bazel, CMake, or Buildbarn
• Familiar with cloud platforms (GCP, AWS) and Kubernetes
• Passion for software engineering best practices
• 3+ years of experience and Bachelor's or Master's in CS or equivalent`,
        salary: "$180k - $250k",
        location: "Mountain View, CA",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 14,
        company: "Anthropic",
        title: "Research Scientist - Alignment",
        logo: <CompanyLogo name="Anthropic" />,
        job_description: `About Anthropic
Anthropic is an AI safety company building reliable, interpretable, and steerable AI systems. We created Claude, one of the world's most capable AI assistants, with safety at its core. Founded by former OpenAI researchers, we're backed by Google and valued at over $15B.

About the Role
We're looking for Research Scientists to work on AI alignment - ensuring AI systems behave in accordance with human values and intentions. You'll conduct research on interpretability, robustness, and value learning.

Key Responsibilities
• Conduct original research on AI alignment and safety
• Develop methods for understanding and controlling AI behavior
• Design experiments to test model capabilities and limitations
• Publish findings at top ML conferences
• Collaborate with engineering to implement safety measures in production

About You
• PhD in Machine Learning, Computer Science, or related field
• Strong publication record at venues like NeurIPS, ICML, or ICLR
• Deep understanding of modern LLM architectures and training
• Experience with interpretability, robustness, or RLHF
• Passion for ensuring AI benefits humanity
• Excellent communication and collaboration skills`,
        salary: "$300k - $450k",
        location: "San Francisco",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 15,
        company: "Stripe",
        title: "Product Designer - Payments",
        logo: <CompanyLogo name="Stripe" />,
        job_description: `About Stripe
Stripe is a financial infrastructure platform for the internet. Millions of companies use Stripe to accept payments, grow revenue, and accelerate new business opportunities. Our mission is to increase the GDP of the internet.

About the Role
We're looking for a Product Designer to shape the future of Stripe's payment experiences. You'll work on products used by millions of merchants and billions of end users, from checkout flows to payment dashboards.

Key Responsibilities
• Design end-to-end user experiences for payment products
• Conduct user research to understand merchant and buyer needs
• Create wireframes, prototypes, and high-fidelity designs
• Partner with engineering to ship polished products
• Define design systems patterns for payments UI

About You
• 5+ years of product design experience
• Strong portfolio demonstrating complex product work
• Experience with financial products or payments preferred
• Proficiency in Figma and prototyping tools
• Understanding of web technologies and technical constraints
• Excellent collaboration skills with product and engineering`,
        salary: "$200k - $280k",
        location: "San Francisco / New York",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 16,
        company: "Figma",
        title: "Engineering Manager - Editor",
        logo: <CompanyLogo name="Figma" />,
        job_description: `About Figma
Figma is the leading collaborative design platform making design accessible to all. Our browser-based tool is used by millions of designers, and our engineering team pushes the boundaries of what's possible on the web.

About the Role
We're hiring an Engineering Manager to lead a team working on Figma's core editor - the canvas, objects, and rendering engine that powers every design. This is one of the most technically challenging areas of our product.

Key Responsibilities
• Lead a team of 6-8 engineers working on the Figma editor
• Drive technical direction for canvas rendering and interaction
• Partner with product and design on editor roadmap
• Hire and develop world-class engineers
• Maintain high performance and quality standards

About You
• 3+ years of engineering management experience
• Strong background in graphics, rendering, or performance optimization
• Experience with WebGL, Canvas API, or similar technologies
• Track record of building and scaling high-performing teams
• Excellent product sense and attention to detail
• Deep passion for design tools and creative software`,
        salary: "$250k - $350k",
        location: "San Francisco",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 17,
        company: "Ramp",
        title: "Senior Backend Engineer - Cards",
        logo: <CompanyLogo name="Ramp" />,
        job_description: `About Ramp
Ramp is building the ultimate platform for modern finance teams. Our corporate cards and spend management software help companies control costs and close their books faster. We're one of the fastest-growing startups ever, valued at $8B+.

About the Role
We're looking for a Senior Backend Engineer to work on our Cards infrastructure. You'll build systems that process millions of transactions, manage credit limits, and ensure our cards work reliably worldwide.

Key Responsibilities
• Design and build card transaction processing systems
• Develop credit decisioning and limit management infrastructure
• Ensure high availability for payment-critical systems
• Partner with card networks and payment processors
• Mentor junior engineers and drive technical excellence

About You
• 5+ years of backend engineering experience
• Experience with Python, Go, or similar languages
• Background in payments, fintech, or financial infrastructure
• Understanding of card networks (Visa, Mastercard) is a plus
• Experience with high-availability distributed systems
• Strong problem-solving and debugging skills`,
        salary: "$190k - $240k",
        location: "New York",
        remote: "Hybrid",
        job_time: "Full-time",
    },
    {
        id: 18,
        company: "Vercel",
        title: "Developer Experience Engineer",
        logo: <CompanyLogo name="Vercel" />,
        job_description: `About Vercel
Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. We created Next.js and host millions of websites for companies like Washington Post, Nintendo, and Notion.

About the Role
We're hiring a Developer Experience Engineer to improve how developers use Vercel and Next.js. You'll create documentation, examples, and tools that help millions of developers build faster.

Key Responsibilities
• Create and maintain documentation for Vercel and Next.js
• Build example applications and starter templates
• Write technical blog posts and tutorials
• Engage with the developer community on GitHub and Discord
• Provide feedback to product teams based on developer needs
• Speak at conferences and represent Vercel

About You
• 3+ years of experience as a developer or developer advocate
• Deep expertise with React, Next.js, and the JavaScript ecosystem
• Excellent technical writing and communication skills
• Active presence in the developer community
• Experience creating educational content
• Passion for helping developers succeed`,
        salary: "$150k - $200k",
        location: "Remote",
        remote: "Yes",
        job_time: "Full-time",
    },
    {
        id: 19,
        company: "Linear",
        title: "Product Engineer",
        logo: <CompanyLogo name="Linear" />,
        job_description: `About Linear
Linear is the issue tracking tool teams love to use. We build software that helps companies streamline development workflows, with a focus on performance, aesthetics, and user experience. Trusted by Vercel, Clerk, and thousands of engineering teams.

About the Role
We're looking for Product Engineers who are passionate about building exceptional software. You'll work across the stack to ship features that delight our users, from database to UI.

Key Responsibilities
• Build new features end-to-end, from database to frontend
• Obsess over performance and user experience details
• Participate in product decisions and roadmap planning
• Write clean, maintainable code with high test coverage
• Collaborate closely with design on implementation

About You
• 4+ years of software engineering experience
• Full-stack proficiency with TypeScript and React
• Strong product sense and attention to detail
• Experience with real-time collaborative applications is a plus
• Passion for developer tools and productivity software
• Portfolio or examples of high-quality product work`,
        salary: "$180k - $250k",
        location: "Remote",
        remote: "Yes",
        job_time: "Full-time",
    },
    {
        id: 20,
        company: "Retool",
        title: "Senior Frontend Engineer",
        logo: <CompanyLogo name="Retool" />,
        job_description: `About Retool
Retool is the fast way to build internal tools. We provide building blocks that let companies build apps 10x faster using drag-and-drop components connected to any database or API. Used by companies like Amazon, DoorDash, and Brex.

About the Role
We're hiring Senior Frontend Engineers to build the Retool editor - a complex application that itself builds applications. You'll work on drag-and-drop interfaces, component systems, and performance optimization.

Key Responsibilities
• Build and maintain the Retool application builder interface
• Develop new components and widgets for end users
• Optimize performance for complex applications
• Design and implement the component API and extension system
• Collaborate with product and design on new features

About You
• 5+ years of frontend engineering experience
• Expert-level React and TypeScript skills
• Experience building complex editor or builder interfaces
• Understanding of drag-and-drop and canvas-based UIs
• Strong performance optimization skills
• Experience with design systems and component libraries`,
        salary: "$200k - $280k",
        location: "San Francisco",
        remote: "Hybrid",
        job_time: "Full-time",
    },
];

const ITEMS_PER_PAGE = 10;

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Filter jobs based on search
    const filteredJobs = useMemo(() => {
        if (!searchQuery.trim()) return sampleJobs;

        const query = searchQuery.toLowerCase();
        return sampleJobs.filter((job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const visibleJobs = filteredJobs.slice(0, visibleCount);
    const hasMore = visibleCount < filteredJobs.length;

    const loadMore = () => {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    };

    const handleJobClick = (job) => {
        console.log("Job clicked:", job.company, job.title);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="pt-16 pb-8">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    {/* Badge */}
                    <div className="selection:bg-[#149F65] selection:text-white flex justify-center mb-6">
                        <Badge2 variant="animated-border">
                            34 new jobs added today
                        </Badge2>
                    </div>

                    {/* Headline */}
                    <h1 className="selection:bg-[#149F65] selection:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold font-outfit text-foreground">
                        Discover opportunities
                        that match your vision.
                    </h1>

                    {/* Subheadline */}
                    <p className="selection:bg-[#149F65] selection:text-white mt-5 font-outfit text-base text-muted-foreground md:text-lg max-w-xl mx-auto">
                        Find <span className="text-foreground font-medium">remote</span> and{" "}
                        <span className="text-foreground font-medium">onsite</span> jobs at today's most ambitious startups.
                        <br className="hidden sm:block" />
                        Updated daily.
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section className="pb-4">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search jobs by position, location or company name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setVisibleCount(ITEMS_PER_PAGE); // Reset on search
                            }}
                            className="h-14 pl-12 pr-4 bg-background border-border rounded-xl text-base font-outfit shadow-sm focus:ring-2 focus:ring-[#149F65]/20 focus:border-[#149F65] transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Job Listings */}
            <section className="py-4">
                <div className="mx-auto max-w-3xl px-6">
                    {visibleJobs.length > 0 ? (
                        <div className="selection:bg-[#149F65] selection:text-white border border-border rounded-xl bg-card overflow-hidden">
                            <JobListingComponent
                                jobs={visibleJobs}
                                onJobClick={handleJobClick}
                                className="!p-0"
                            />
                            {/* Load More Button - inside card container */}
                            {hasMore && (
                                <div className="border-t border-border">
                                    <button
                                        onClick={loadMore}
                                        className="flex items-center justify-center gap-2 w-full py-2 text-md font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors font-outfit group"
                                    >
                                        Load More
                                        <ChevronDownIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="selection:bg-[#149F65] selection:text-white py-16 text-center border border-border rounded-xl">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold font-outfit">No jobs found</h3>
                            <p className="mt-2 text-muted-foreground font-outfit">
                                Try adjusting your search to find what you're looking for.
                            </p>
                        </div>
                    )}

                    {/* Results info */}
                    {/* {filteredJobs.length > 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground font-outfit">
                            Showing {visibleJobs.length} of {filteredJobs.length} opportunities
                        </div>
                    )} */}
                </div>
            </section>
        </div>
    );
}
