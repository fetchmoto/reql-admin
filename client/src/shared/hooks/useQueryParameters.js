import { useState, useEffect } from 'react';

/**
 * React Hook for uri query parameters.
 */
export function useQueryParameters() {

  // Retrieves the uri, and splits parameters into an array.
  const retrieveParameters = () => {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
  }

  // Local state that holds the params
  const [parameters, setParameters] = useState(retrieveParameters);

  // When the URL changes, get new params.
  useEffect(() => {
    const params = retrieveParameters();
    setParameters(params);
  }, [window.location.href]);

  return parameters;
}
