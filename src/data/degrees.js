// --- TOP 4 QUICK SELECT DEGREES ---
    export const QUICK_DEGREES = [
      {
        id: "btech",
        shortTitle: "B.Tech / B.E.",
        fullName: "B.Tech in Computer Science & Engineering",
        specialization: "Computer Science & Systems",
        stream: "Engineering",
        icon: "cpu",
        badge: "Most Popular",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
      },
      {
        id: "bsc",
        shortTitle: "B.Sc",
        fullName: "B.Sc in Statistics & Data Analytics",
        specialization: "Statistics & Data Analytics",
        stream: "Science",
        icon: "bar-chart-3",
        badge: "MoSPI Core",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
      },
      {
        id: "bcom",
        shortTitle: "B.Com",
        fullName: "B.Com in Business Analytics & Statistics",
        specialization: "Commerce, Finance & Analytics",
        stream: "Commerce",
        icon: "trending-up",
        badge: "Finance Base",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
      },
      {
        id: "bca",
        shortTitle: "BCA",
        fullName: "Bachelor of Computer Applications (BCA)",
        specialization: "Software & Web Development",
        stream: "IT & Apps",
        icon: "laptop",
        badge: "High Demand",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200"
      }
    ];

    // --- COMPREHENSIVE NATIONAL DEGREE REGISTRY (75+ DEGREES) ---
    export const DEGREES_LIST = [
      // Engineering & Technology
      { name: "B.Tech in Computer Science & Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Information Technology", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Artificial Intelligence & Data Science", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Electronics & Communication Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Electrical & Electronics Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Mechanical Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Civil Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Chemical Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Biotechnology", stream: "Engineering", code: "B.Tech" },
      { name: "B.Tech in Aerospace Engineering", stream: "Engineering", code: "B.Tech" },
      { name: "B.E. in Computer Engineering", stream: "Engineering", code: "B.E." },
      { name: "B.E. in Information Science", stream: "Engineering", code: "B.E." },
      { name: "M.Tech in Computer Science & Engineering", stream: "Engineering", code: "M.Tech" },
      { name: "M.Tech in Data Analytics & Machine Learning", stream: "Engineering", code: "M.Tech" },
      { name: "M.Tech in VLSI & Embedded Systems", stream: "Engineering", code: "M.Tech" },
      
      // Computer Applications & IT
      { name: "Bachelor of Computer Applications (BCA)", stream: "IT & Apps", code: "BCA" },
      { name: "Master of Computer Applications (MCA)", stream: "IT & Apps", code: "MCA" },
      { name: "B.Sc in Computer Science", stream: "IT & Apps", code: "B.Sc" },
      { name: "M.Sc in Computer Science", stream: "IT & Apps", code: "M.Sc" },
      { name: "Post Graduate Diploma in Computer Applications (PGDCA)", stream: "IT & Apps", code: "PGDCA" },

      // Commerce, Accounting & Finance
      { name: "B.Com in Business Analytics & Statistics", stream: "Commerce", code: "B.Com" },
      { name: "B.Com (Honours in Accounting & Finance)", stream: "Commerce", code: "B.Com" },
      { name: "B.Com (General)", stream: "Commerce", code: "B.Com" },
      { name: "B.Com in Banking & Insurance", stream: "Commerce", code: "B.Com" },
      { name: "B.Com in Financial Markets", stream: "Commerce", code: "B.Com" },
      { name: "M.Com (Master of Commerce in Finance)", stream: "Commerce", code: "M.Com" },
      { name: "Chartered Accountancy (CA - ICAI)", stream: "Commerce", code: "CA" },
      { name: "Cost & Management Accounting (CMA - ICMAI)", stream: "Commerce", code: "CMA" },
      { name: "Company Secretary (CS - ICSI)", stream: "Commerce", code: "CS" },

      // Management & Business Administration
      { name: "Bachelor of Business Administration (BBA)", stream: "Management", code: "BBA" },
      { name: "BBA in Business Analytics", stream: "Management", code: "BBA" },
      { name: "BBA in Digital Marketing", stream: "Management", code: "BBA" },
      { name: "Bachelor of Management Studies (BMS)", stream: "Management", code: "BMS" },
      { name: "Master of Business Administration (MBA)", stream: "Management", code: "MBA" },
      { name: "MBA in Business Analytics & Data Science", stream: "Management", code: "MBA" },
      { name: "MBA in Finance", stream: "Management", code: "MBA" },
      { name: "MBA in Human Resource Management", stream: "Management", code: "MBA" },
      { name: "Post Graduate Diploma in Management (PGDM)", stream: "Management", code: "PGDM" },

      // Science, Statistics & Mathematics
      { name: "B.Sc in Statistics & Data Analytics", stream: "Science", code: "B.Sc" },
      { name: "B.Sc in Mathematics & Computing", stream: "Science", code: "B.Sc" },
      { name: "B.Sc in Physics", stream: "Science", code: "B.Sc" },
      { name: "B.Sc in Chemistry", stream: "Science", code: "B.Sc" },
      { name: "B.Sc in Biotechnology & Bioinformatics", stream: "Science", code: "B.Sc" },
      { name: "B.Sc in Agriculture", stream: "Science", code: "B.Sc" },
      { name: "M.Sc in Statistics & Applied Mathematics", stream: "Science", code: "M.Sc" },
      { name: "M.Sc in Data Science & Big Data", stream: "Science", code: "M.Sc" },
      { name: "M.Sc in Applied Mathematics", stream: "Science", code: "M.Sc" },
      { name: "M.Sc in Physics / Applied Physics", stream: "Science", code: "M.Sc" },

      // Arts, Humanities & Social Sciences
      { name: "B.A. in Economics", stream: "Arts", code: "B.A." },
      { name: "B.A. in English Literature", stream: "Arts", code: "B.A." },
      { name: "B.A. in Political Science", stream: "Arts", code: "B.A." },
      { name: "B.A. in Psychology", stream: "Arts", code: "B.A." },
      { name: "B.A. in Sociology & Public Policy", stream: "Arts", code: "B.A." },
      { name: "B.A. in Journalism & Mass Communication (BJMC)", stream: "Arts", code: "B.A." },
      { name: "B.A. in History", stream: "Arts", code: "B.A." },
      { name: "M.A. in Economics & Econometrics", stream: "Arts", code: "M.A." },
      { name: "M.A. in Public Policy & Governance", stream: "Arts", code: "M.A." },
      { name: "M.A. in English", stream: "Arts", code: "M.A." },
      { name: "Master of Social Work (MSW)", stream: "Arts", code: "MSW" },

      // Medical, Pharmacy & Healthcare
      { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", stream: "Medical", code: "MBBS" },
      { name: "BDS (Bachelor of Dental Surgery)", stream: "Medical", code: "BDS" },
      { name: "B.Pharm (Bachelor of Pharmacy)", stream: "Medical", code: "B.Pharm" },
      { name: "M.Pharm (Master of Pharmacy)", stream: "Medical", code: "M.Pharm" },
      { name: "B.Sc in Nursing", stream: "Medical", code: "B.Sc" },
      { name: "BPT (Bachelor of Physiotherapy)", stream: "Medical", code: "BPT" },
      { name: "BAMS (Bachelor of Ayurvedic Medicine & Surgery)", stream: "Medical", code: "BAMS" },
      { name: "BHMS (Bachelor of Homeopathic Medicine & Surgery)", stream: "Medical", code: "BHMS" },
      { name: "Master of Public Health (MPH)", stream: "Medical", code: "MPH" },

      // Law & Legal Studies
      { name: "LLB (3-Year Bachelor of Laws)", stream: "Law", code: "LLB" },
      { name: "BA LLB (5-Year Integrated Law)", stream: "Law", code: "BA LLB" },
      { name: "BBA LLB (5-Year Integrated Corporate Law)", stream: "Law", code: "BBA LLB" },
      { name: "B.Com LLB (5-Year Integrated Taxation & Law)", stream: "Law", code: "B.Com LLB" },
      { name: "LLM (Master of Laws)", stream: "Law", code: "LLM" },

      // Design & Architecture
      { name: "B.Arch (Bachelor of Architecture)", stream: "Design & Arch", code: "B.Arch" },
      { name: "M.Arch (Master of Architecture)", stream: "Design & Arch", code: "M.Arch" },
      { name: "B.Des in Interaction & UI/UX Design", stream: "Design & Arch", code: "B.Des" },
      { name: "B.Des in Graphic & Communication Design", stream: "Design & Arch", code: "B.Des" },
      { name: "B.Des in Product & Industrial Design", stream: "Design & Arch", code: "B.Des" },
      { name: "Bachelor of Fine Arts (BFA)", stream: "Design & Arch", code: "BFA" },

      // Education & Teaching
      { name: "Bachelor of Education (B.Ed)", stream: "Education", code: "B.Ed" },
      { name: "Master of Education (M.Ed)", stream: "Education", code: "M.Ed" },
      { name: "B.P.Ed (Physical Education)", stream: "Education", code: "B.P.Ed" },

      // Vocational, Diplomas & ITI
      { name: "ITI Diploma in COPA (Computer Operator & Programming Assistant)", stream: "Vocational", code: "ITI" },
      { name: "ITI Diploma in Electrician / Wireman", stream: "Vocational", code: "ITI" },
      { name: "Polytechnic Diploma in Computer Engineering", stream: "Vocational", code: "Diploma" },
      { name: "Polytechnic Diploma in Mechanical Engineering", stream: "Vocational", code: "Diploma" },
      { name: "Polytechnic Diploma in Civil Engineering", stream: "Vocational", code: "Diploma" },
      { name: "Polytechnic Diploma in Electrical Engineering", stream: "Vocational", code: "Diploma" },
      { name: "B.Voc in Software Development & IT", stream: "Vocational", code: "B.Voc" },
      { name: "Post Graduate Diploma in Big Data Analytics (PG-DAC)", stream: "Vocational", code: "PG-DAC" },

      // Doctoral & Research (Ph.D.)
      { name: "Ph.D. in Computer Science & Artificial Intelligence", stream: "Doctoral", code: "Ph.D." },
      { name: "Ph.D. in Statistics & Econometrics", stream: "Doctoral", code: "Ph.D." },
      { name: "Ph.D. in Management & Business Administration", stream: "Doctoral", code: "Ph.D." },
      { name: "Ph.D. in Mathematics & Computing", stream: "Doctoral", code: "Ph.D." },
      { name: "Ph.D. in Economics & Public Policy", stream: "Doctoral", code: "Ph.D." },
      { name: "Ph.D. in Life Sciences & Biotechnology", stream: "Doctoral", code: "Ph.D." }
    ];

    export const DEGREES = DEGREES_LIST.map(d => d.name);
