export default function InsightsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold">Insights Tab Locked</h1>
          <p className="text-muted-foreground text-lg">
            Complete the mission to unlock this feature
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4 border">
          <h2 className="text-xl font-semibold">Mission Objective</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>The creatives need to see 'Ad Performance Scores' for their generated scripts.</strong>
            </p>
            <p>
              The data is available via <code className="bg-background px-2 py-1 rounded">/api/insights/performance</code> (uses mock data by default, no database needed).
            </p>
            <p>
              <strong>Build the 'Insights' tab</strong> to fetch this data and show a Gemini-generated summary of why the ad is likely to go viral.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold">What you need to do:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Remove the locked state from this page</li>
            <li>Fetch performance data from <code className="bg-background px-1 py-0.5 rounded">/api/insights/performance</code></li>
            <li>Display scripts with their performance metrics</li>
            <li>Implement Gemini summary generation via <code className="bg-background px-1 py-0.5 rounded">/api/insights/generate-summary</code></li>
            <li>Show viral predictions to help creatives understand what works</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4">
          {/* TODO: Candidate - Remove locked state and implement Insights UI */}
          {/* Reference existing patterns: ChatWindow, other page components */}
          {/* Use the API endpoints in app/api/insights/ */}
        </div>
      </div>
    </div>
  );
}

