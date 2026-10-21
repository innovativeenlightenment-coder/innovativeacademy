"use client";

import RenderMath from "@/lib/renderMaths";
import { Question } from "@/types/questionType";
import { Box, Radio } from "@mui/material";
import Image from "next/image";

interface Props {
  index: number;
  data: Question;
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

export default function QuestionCard({
  index,
  data,
  selectedOption,
  onSelect,
}: Props) {
  const letters = ["A", "B", "C", "D"];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        bgcolor: "#FFFFFF",
        boxSizing: "border-box",
      }}
    >
      {/* QUESTION CONTENT */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: 1.5,
          pb: 1.5,
        }}
      >
        {data.questionType === "text" ? (
          <Box
            sx={{
              color: "#20283A",
              fontSize: { xs: 15, sm: 17 },
              fontWeight: 550,
              lineHeight: 1.65,
              overflowWrap: "anywhere",
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
              "& p": {
                my: 0,
              },
            }}
          >
            <RenderMath text={data.question.text} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              minHeight: 80,
              maxHeight: 230,
              overflow: "auto",
              bgcolor: "#F8F9FC",
              border: "1px solid #EDF0F5",
              borderRadius: 1.5,
              p: 1,
              boxSizing: "border-box",
            }}
          >
            <Image
              src={data.question.imgUrl || ""}
              alt={`Question ${index + 1}`}
              width={700}
              height={450}
              sizes="(max-width: 900px) 90vw, 700px"
              style={{
                display: "block",
                width: "auto",
                maxWidth: "100%",
                height: "auto",
                maxHeight: 210,
                objectFit: "contain",
              }}
            />
          </Box>
        )}
      </Box>

      {/* ANSWER OPTIONS */}
      <Box
        role="radiogroup"
        aria-label={`Answers for question ${index + 1}`}
        sx={{
          px: { xs: 1.5, sm: 2 },
          pb: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.8,
        }}
      >
        {data.options.map((option, idx) => {
          const selected = selectedOption === idx;
          const letter = letters[idx] ?? String(idx + 1);

          return (
            <Box
              key={idx}
              role="radio"
              aria-checked={selected}
              aria-label={`Option ${letter}`}
              tabIndex={0}
              onClick={() => onSelect(idx)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(idx);
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();

                  const next = event.currentTarget
                    .nextElementSibling as HTMLElement | null;

                  next?.focus();
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();

                  const previous = event.currentTarget
                    .previousElementSibling as HTMLElement | null;

                  previous?.focus();
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.2,
                py: 0.8,
                minHeight: 46,
                boxSizing: "border-box",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: selected ? "#7565E8" : "#E3E7EF",
                bgcolor: selected ? "#F3F1FF" : "#FFFFFF",
                cursor: "pointer",
                transition:
                  "border-color 120ms ease, background-color 120ms ease",
                "&:hover": {
                  borderColor: selected ? "#7565E8" : "#B8B2EF",
                  bgcolor: selected ? "#F3F1FF" : "#FAFAFF",
                },
                "&:focus-visible": {
                  outline: "2px solid #7565E8",
                  outlineOffset: 1,
                },
              }}
            >
              {/* RADIO */}
              <Radio
                checked={selected}
                disableRipple
                size="small"
                onClick={(event) => event.stopPropagation()}
                onChange={() => onSelect(idx)}
                sx={{
                  p: 0.3,
                  color: "#C4CAD6",
                  "&.Mui-checked": {
                    color: "#6254D9",
                  },
                }}
              />

              {/* OPTION LETTER */}
              <Box
                sx={{
                  width: 27,
                  height: 27,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1,
                  bgcolor: selected ? "#6254D9" : "#F0F2F7",
                  color: selected ? "#FFFFFF" : "#59647A",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {letter}
              </Box>

              {/* OPTION CONTENT */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: 0.25,
                }}
              >
                {data.optionType === "text" ? (
                  <Box
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      lineHeight: 1.55,
                      fontWeight: selected ? 650 : 450,
                      color: "#30394D",
                      overflowWrap: "anywhere",
                      "& p": {
                        my: 0,
                      },
                    }}
                  >
                    <RenderMath
                      text={(option.text ?? "")
                        .trim()
                        .replace(/^[A-D]\)\s*/, "")}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <Image
                      src={option.imgUrl || ""}
                      alt={`Option ${letter}`}
                      width={240}
                      height={160}
                      sizes="(max-width: 600px) 65vw, 240px"
                      style={{
                        display: "block",
                        width: "auto",
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: 140,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* SELECTION INDICATOR */}
              {selected && (
                <Box
                  aria-hidden="true"
                  sx={{
                    flexShrink: 0,
                    color: "#6254D9",
                    fontWeight: 900,
                    fontSize: 15,
                    pr: 0.3,
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}