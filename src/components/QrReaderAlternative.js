// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
import React, { useEffect, useRef } from 'react';

export default function QrReader() {
  // const barcodeDetector = new window.BarcodeDetector({
  //   formats: ['qr_code', 'code_128'],
  // });
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    const startScan = setInterval(async () => {
      let video = videoRef.current;
      let photo = photoRef.current;
      let ctx = photo.getContext('2d');

      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // console.log('scan', await barcodeDetector.detect(video));
    }, 1000);

    const getVideo = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
          },
        })
        .then((stream) => {
          // const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
          const video = videoRef.current;

          video.srcObject = stream;
        })
        .catch((err) => {
          console.error('error:', err);
        });
    };

    getVideo();

    return () => clearInterval(startScan);
  }, [videoRef]);

  return (
    <div className="container">
      {/* <input type="file" accept="image/*" capture="environment"></input> */}
      <video autoPlay ref={videoRef} />
      <canvas ref={photoRef} width="640" height="480" />
    </div>
  );
}
