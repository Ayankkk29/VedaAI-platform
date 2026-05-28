  // Status rendering logic
  const renderStatusInfo = () => {
    switch (assignment.status) {
      case 'queued':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-amber-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Queued for generation...</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic pl-1">
              (First request may take 30s to wake the server)
            </p>
          </div>
        );
      case 'processing':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-indigo-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI generating questions...</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic pl-1">
              (First request may take 30s to wake the server)
            </p>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed. Tap menu to retry</span>
          </div>
        );
      case 'completed':
      default:
        return (
          <>
            {/* Desktop dates view (split bottom line) */}
            <div className="hidden sm:flex items-center justify-between text-gray-500 text-[13px] mt-4 pt-4 border-t border-gray-100/60">
              <div>
                <span className="text-gray-400">Assigned on : </span>
                <span className="font-semibold text-gray-700">{formatDate(assignment.createdAt)}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="text-gray-400">Due : </span>
                  <span className="font-semibold text-gray-700">{formatDate(assignment.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Mobile dates view (single responsive line below title matching Screen 2) */}
            <div className="sm:hidden flex flex-wrap items-center gap-x-3 text-[12px] text-gray-500 mt-2">
              <div>
                <span className="text-gray-400">Assigned on : </span>
                <span className="font-semibold text-gray-700">{formatDate(assignment.createdAt)}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="text-gray-400">Due : </span>
                  <span className="font-semibold text-gray-700">{formatDate(assignment.dueDate)}</span>
                </div>
              )}
            </div>
          </>
        );
    }
  };
