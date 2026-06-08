import React, { useState } from "react";

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    ["How does AI solar survey work?", "Our AI analyzes electricity bill, roof details and usage data."],
    ["Can I calculate solar subsidy?", "Yes, subsidy automatically calculate hoti hai."],
    ["Can I download the report?", "Yes, PDF report download ho sakti hai."],
    ["Is physical survey required?", "Initial report digitally generate ho sakti hai."],
    ["Can companies manage leads?", "Yes, company dashboard me leads manage hongi."],
    ["Does it support roof analysis?", "AI roof analysis next phase me add hoga."],
    ["Is my data secure?", "Yes, data Firebase me user-wise secure rahega."],
    ["Will chatbot support AI later?", "Yes, later Gemini/OpenAI API se connect hoga."]
  ];

  return (
    <section
      style={{
        width: "100%",
        background: "#f7fbf8",
        padding: "70px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "34px",
            fontWeight: "800",
            color: "#004d3a",
            marginBottom: "35px",
          }}
        >
          Frequently Asked Questions
        </h2>

        {faqs.map((item, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #dcefe6",
              borderRadius: "16px",
              marginBottom: "14px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              style={{
                width: "100%",
                padding: "18px 22px",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: "700",
                color: "#004d3a",
              }}
            >
              <span>{item[0]}</span>
              <span style={{ fontSize: "26px", lineHeight: "1" }}>
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            {openIndex === index && (
              <div
                style={{
                  padding: "0 22px 18px",
                  color: "#555",
                  fontSize: "15px",
                  lineHeight: "1.6",
                }}
              >
                {item[1]}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;