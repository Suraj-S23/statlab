# LabRat 🐀

Statistical analysis for researchers. No coding required.

Upload a CSV, pick a test, get results.

🔗 **[Try it live](https://labrat-frontend-production.up.railway.app)**

---

## The problem

Running standard statistical tests usually means setting up Python or R, installing packages, writing code, and debugging environment issues before you even look at your data. For a researcher who needs to compare two groups or fit a dose-response curve, that setup cost is often not worth it.

LabRat is a web app that removes that friction. Drop in a CSV, select your columns, and get back results with charts and interpretation text. No installation, no account.

---

## Supported analyses

| Test | When to use |
|---|---|
| **Descriptive Statistics** | Summarise numeric columns: mean, median, std, IQR, outliers, distribution |
| **t-test / Mann-Whitney U** | Compare a measurement between two groups |
| **One-Way ANOVA / Kruskal-Wallis** | Compare a measurement across three or more groups |
| **Pearson / Spearman Correlation** | Measure the relationship between two numeric variables |
| **Simple Linear Regression** | Predict one variable from another |
| **Chi-Square / Fisher's Exact Test** | Test association between two categorical variables |
| **Dose-Response / IC50** | Fit a 4-parameter logistic curve to concentration-response data |
| **Kaplan-Meier Survival Analysis** | Estimate survival probability over time, with optional group stratification |

Where relevant, LabRat runs both parametric and non-parametric versions simultaneously (e.g. t-test and Mann-Whitney U) and flags which is appropriate based on normality testing.

---

## How it works

1. Upload a CSV. LabRat detects column types automatically.
2. Review the suggested tests based on your data structure.
3. Select the columns to analyse.
4. View results: statistics, charts, and a plain-English interpretation.
5. Export as PDF, PNG, or CSV.

Available in English, Deutsch, and Français.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Recharts, Framer Motion |
| Backend | FastAPI, SciPy, Pandas, scikit-learn |
| Session storage | Redis (2-hour TTL, no persistent user data) |
| Deployment | Railway |
| Containerisation | Docker |

No user accounts. No data retention. Uploaded data lives in Redis for 2 hours and is then deleted.

---

## Running locally

Requires Docker and Docker Compose.

```bash
git clone https://github.com/Suraj-S23/LabRat
cd LabRat
docker compose up --build
```

## Project structure

```
LabRat/
├── backend/
│   ├── main.py               # FastAPI app
│   ├── routers/              # upload, suggest, analysis endpoints
│   ├── services/
│   │   ├── analysis.py       # statistical test implementations
│   │   └── suggest.py        # test suggestions based on column types
│   └── utils/
│       └── session.py        # Redis session management
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/       # result displays, selectors, charts
│   │   ├── i18n/             # EN / DE / FR translations
│   │   ├── services/api.ts
│   │   └── types/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

Built by [Suraj Subramanian](https://github.com/Suraj-S23). MSc Computer Science, Albert-Ludwigs-Universität Freiburg.

[LinkedIn](www.linkedin.com/in/suraj-subramanian-2314ss) · [GitHub](https://github.com/Suraj-S23)
