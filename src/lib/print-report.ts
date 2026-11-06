/** Opens the browser print dialog (save as PDF) for one report variant; CSS in styles.css hides the other parts. */
export function printReport(kind: "school" | "subject" | "student", title: string) {
  const prevTitle = document.title;
  document.body.dataset["report"] = kind;
  document.title = title; // becomes the default PDF file name
  const done = () => { delete document.body.dataset["report"]; document.title = prevTitle; window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  setTimeout(() => window.print(), 50);
}
