import { Box, Button, Container, Zoom } from '@material-ui/core';
import React, { useRef } from 'react';

const transitionTimer = 500;

export default function Home() {
  const scannerInputRef = useRef(null);

  return (
    <Container maxWidth="xs">
      <Zoom appear in={true} timeout={transitionTimer}>
        <Box>
          <Box clone mt={1}>
            <form onSubmit={() => {}}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Escanear muestra
              </Button>
            </form>
          </Box>
        </Box>
      </Zoom>
    </Container>
  );
}
