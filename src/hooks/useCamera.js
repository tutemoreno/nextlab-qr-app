import { useEffect, useRef } from 'react';
import { useFormState } from './';

export const useCamera = (open) => {
  const { content, onChange, setContent } = useFormState({
    device: '',
    devices: [],
  });
  const { device, devices } = content;
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        );

        setContent({
          device: videoDevices[videoDevices.length - 1].deviceId,
          devices: videoDevices,
        });
      } catch (error) {
        console.log('[enumerateDevices]', error);
      }
    })();
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: device,
            facingMode: 'environment',
          },
        });

        videoRef.current.srcObject = stream;
      } catch (error) {
        console.log(error, 'QR Error');
      }
    };

    const cleanUp = () => {
      const stream = videoRef.current.srcObject;

      if (stream)
        stream.getTracks().forEach((track) => {
          track.stop();
        });
    };

    if (open && device) startVideo();

    return cleanUp;
  }, [open, device]);

  return {
    device,
    devices,
    onDeviceChange: onChange,
    videoRef,
  };
};
