export const SAMPLE_QUIZ_QUESTIONS = [
      {
        id: 1,
        question: "In React 18, how does Concurrent Rendering enhance UI responsiveness compared to legacy synchronous rendering?",
        topic: "Modern Frontend Architecture",
        sourceModule: "iGOT-CS-101 Module 2",
        options: [
          "By completely removing the Virtual DOM diffing process",
          "By yielding rendering execution to the browser main thread via interruptible task prioritization",
          "By executing all state mutations in Node.js server threads exclusively",
          "By forcing synchronous DOM repaints on every component update"
        ],
        correctIndex: 1,
        explanation: "React 18 Concurrent Rendering allows React to pause, resume, and prioritize rendering work, ensuring high-priority user interactions (like typing) are not blocked by heavy background rendering."
      },
      {
        id: 2,
        question: "Under the MoSPI National Indicator Framework (NIF), what is the primary purpose of Stratified Multi-Stage Random Sampling?",
        topic: "MoSPI Statistical Methodologies",
        sourceModule: "iGOT-STAT-204 Module 4",
        options: [
          "To eliminate the need for standard error estimation",
          "To ensure adequate proportional representation across diverse geographical and socioeconomic sub-strata across Indian States",
          "To replace computer-assisted field interviewing (CAPI) with manual forms",
          "To restrict sample observations exclusively to metro urban centers"
        ],
        correctIndex: 1,
        explanation: "Stratified Multi-Stage sampling ensures that both rural and urban diverse socio-economic sub-groups across all states are adequately represented in MoSPI nationwide surveys (e.g. NSSO rounds)."
      },
      {
        id: 3,
        question: "Which Docker command constructs an immutable container image according to the declarative instructions in a Dockerfile?",
        topic: "Containerization & Cloud Infrastructure",
        sourceModule: "IGOT-OPS-302 Module 3",
        options: [
          "docker run -it container",
          "docker exec -u root build",
          "docker build -t skillbank-api .",
          "docker commit -m container_id"
        ],
        correctIndex: 2,
        explanation: "'docker build -t <tag> .' reads the Dockerfile in the context directory, executes each layer instruction sequentially, and registers the final tagged image."
      },
      {
        id: 4,
        question: "In statistical time-series forecasting, what characteristic signifies that a dataset has achieved 'Weak Stationarity' (Stationary in Mean and Variance)?",
        topic: "Economic Analytics & Forecasting",
        sourceModule: "iGOT-DATA-108 Module 5",
        options: [
          "Constant mean and variance over time with auto-covariance independent of time t",
          "An exponential upward trend line with season-dependent spikes",
          "Zero standard deviation across all historic observation intervals",
          "A regression slope exactly equivalent to 1.0"
        ],
        correctIndex: 0,
        explanation: "A weakly stationary time series maintains a time-invariant mean and variance, with covariance depending only on the time lag between observations rather than calendar time."
      },
      {
        id: 5,
        question: "When establishing secure RESTful microservices for government portals, which token-based authentication mechanism enables stateless authorization?",
        topic: "Secure Software Architecture",
        sourceModule: "iGOT-CS-101 Module 5",
        options: [
          "Basic Base64 HTTP Headers without expiration",
          "Cryptographically signed JSON Web Tokens (JWT) with asymmetric RS256 keys",
          "Hardcoded API Keys stored inside client-side localStorage",
          "Raw SQL query parameters passed in query strings"
        ],
        correctIndex: 1,
        explanation: "Stateless authorization is best accomplished through cryptographically signed JWTs (using RS256 or ES256) which carry claims and expiration without querying a central session database on every request."
      }
    ];
