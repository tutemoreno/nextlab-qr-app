// DOCS
// https://itnext.io/accessing-the-webcam-with-javascript-and-react-33cbe92f49cb
// https://googlechrome.github.io/samples/image-capture/index.html
// https://webrtc.github.io/samples/
import React, { useEffect, useRef } from 'react';

export default function QrReader() {
  const barcodeDetector = new window.BarcodeDetector({
    formats: ['qr_code', 'code_128', 'pdf417'],
  });
  const videoRef = useRef(null);
  // const photoRef = useRef(null);

  useEffect(() => {
    const startScan = async () => {
      // let video = videoRef.current;
      // let photo = photoRef.current;
      // let ctx = photo.getContext('2d');
      // ctx.drawImage(video, 0, 0);
      console.log('scan', await barcodeDetector.detect(videoRef.current));
    };

    const getVideo = async () => {
      let devices = await navigator.mediaDevices.enumerateDevices();

      devices = devices.filter(
        (device) =>
          device.kind === 'videoinput' && device.label.includes('back'),
      );

      devices.forEach((device) => console.log(device.getCapabilities()));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId:
            '1020c7ad24f871f2e0fd4988109f88dc197a5c05546e8dfdd282a0be13b4e807',
          resizeMode: 'none',
          facingMode: 'environment',
        },
      });

      console.log(stream.getVideoTracks()[0].getCapabilities());

      // console.log(stream.getVideoTracks()[0].getConstraints());
      console.log(stream.getVideoTracks()[0].getSettings());

      videoRef.current.srcObject = stream;

      setInterval(startScan, 200);
    };

    getVideo();

    return () => clearInterval(startScan);
  }, [videoRef]);

  return (
    <div className="container">
      {/* <input type="file" accept="image/*" capture="environment"></input> */}
      <video autoPlay ref={videoRef} />
      {/* <canvas ref={photoRef} width="640" height="480" /> */}
    </div>
  );
}
