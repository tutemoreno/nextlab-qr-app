import { useEffect, useRef, useState } from 'react';

export const useCamera = (isOpen) => {
  const [state, setState] = useState({
    device: '',
    devices: [],
    stream: null,
  });
  const { device, devices, stream } = state;
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        );

        setState((prevState) => ({
          ...prevState,
          device: videoDevices[videoDevices.length - 1].deviceId,
          devices: videoDevices,
        }));
      } catch (error) {
        console.log('[enumerateDevices]', error);
      }
    })();
  }, []);

  useEffect(() => {
    let srcStream;

    const startVideo = async () => {
      try {
        srcStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: device,
            facingMode: 'environment',
          },
        });

        videoRef.current.srcObject = srcStream;

        setState((prevState) => ({ ...prevState, stream: srcStream }));
      } catch (error) {
        console.log('[startVideo]', error);
      }
    };

    const cleanUp = () => {
      if (srcStream)
        srcStream.getTracks().forEach((track) => {
          track.stop();
        });
    };

    if (isOpen && device) startVideo();

    return cleanUp;
  }, [isOpen, device]);

  return {
    device,
    devices,
    setState,
    stream,
    videoRef,
  };
};
