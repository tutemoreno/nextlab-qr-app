import { useEffect, useRef } from 'react';
import { useFormState } from './';

export const useCamera = (isOpen) => {
  const { content, onChange, setValue, setContent } = useFormState({
    device: '',
    devices: [],
    stream: null,
  });
  const { device, devices, stream } = content;
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        );

        setContent((prevState) => ({
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

        setValue('stream', srcStream);
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
    stream,
    onDeviceChange: onChange,
    videoRef,
  };
};
