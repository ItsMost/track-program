// Exercise names stay exactly as the coach wrote them: the browser's
// auto-translate (Chrome / Google Translate) turns them into nonsense.
// Notes and the rest of the page can still be translated.
export default function ExerciseName({ children }) {
  return <span translate="no" className="notranslate">{children}</span>;
}
