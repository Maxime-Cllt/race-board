/**
 * Utility to get the local IP address of the machine
 * This is useful for generating QR codes that can be scanned from other devices
 */

/**
 * Get local IP address using WebRTC
 * This works in the browser and detects the local network IP
 */
export async function getLocalIP(): Promise<string | null> {
  return new Promise((resolve) => {
    // If not in browser, return null
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    // Check if RTCPeerConnection is available
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      (window as unknown as { webkitRTCPeerConnection?: typeof window.RTCPeerConnection }).webkitRTCPeerConnection ||
      (window as unknown as { mozRTCPeerConnection?: typeof window.RTCPeerConnection }).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve(null);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [],
    });

    pc.createDataChannel("");

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => resolve(null));

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        return;
      }

      const candidate = ice.candidate.candidate;

      // Extract IP address from candidate string
      // Format: "candidate:... <ip> <port> typ host"
      const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);

      if (ipMatch) {
        const ip = ipMatch[0];
        // Ignore loopback addresses
        if (ip !== "127.0.0.1" && !ip.startsWith("0.")) {
          pc.close();
          resolve(ip);
          return;
        }
      }
    };

    // Timeout after 3 seconds
    setTimeout(() => {
      pc.close();
      resolve(null);
    }, 3000);
  });
}

/**
 * Replace localhost in URL with local IP address
 */
export function replaceLocalhostWithIP(url: string, localIP: string): string {
  return url
    .replace("localhost", localIP)
    .replace("127.0.0.1", localIP);
}

/**
 * Get the shareable URL for QR code generation
 * If the current URL is localhost, it will try to replace it with the local IP
 */
export async function getShareableURL(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  const currentUrl = window.location.href;

  // If not localhost, return as is
  if (!currentUrl.includes("localhost") && !currentUrl.includes("127.0.0.1")) {
    return currentUrl;
  }

  // Try to get local IP
  const localIP = await getLocalIP();

  if (localIP) {
    return replaceLocalhostWithIP(currentUrl, localIP);
  }

  // If we can't get IP, return the original URL
  return currentUrl;
}
