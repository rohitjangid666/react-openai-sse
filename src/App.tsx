import { useEffect, useRef, useState } from 'react';

import { Box, Flex, Heading, Text, Textarea } from '@chakra-ui/react';
import { SSE } from 'sse.js';
import type { ReadyStateEvent, SSEvent } from 'sse.js';

import { Button } from './components/ui/button';

import './App.css';

const API_KEY = import.meta.env.VITE_OPEN_AI_API_KEY;

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const resultRef = useRef<string>('');

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrompt(value);
  };

  const handleSubmit = async () => {
    if (prompt) {
      setIsLoading(true);
      setResult('');

      const url = '';
      const data = {
        model: 'text-davinci-003',
        prompt,
        temperature: 0.75,
        top_p: 0.95,
        max_tokens: 100,
        stream: true,
        n: 1,
      };

      const source = new SSE(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        method: 'POST',
        payload: JSON.stringify(data),
      });

      source.onmessage = (e: SSEvent) => {
        if (e.data !== '[DONE]') {
          const payload = JSON.parse(e.data);
          const text = payload.choices[0].text;

          if (text !== '\n') {
            console.log('Text: ' + text);
            resultRef.current = resultRef.current + text;
            console.log('resultRef.current' + resultRef.current);
            setResult(resultRef.current);
          }
        } else {
          source.close();
        }
      };

      source.onreadystatechange = (e: ReadyStateEvent) => {
        if (e.readyState >= 2) {
          setIsLoading(false);
        }
      };

      source.stream();

      // ** another way
      // source.addEventListener('message', (e: SSEvent) => {
      //   if (e.data !== '[DONE]') {
      //     const payload = JSON.parse(e.data);
      //     const text = payload.choices[0].text;
      //     if (text !== '\n') {
      //       console.log('Text: ' + text);
      //       resultRef.current = resultRef.current + text;
      //       console.log('resultRef.current' + resultRef.current);
      //       setResult(resultRef.current);
      //     }
      //   } else {
      //     source.close();
      //   }
      // });

      // source.addEventListener('readystatechange', (e: ReadyStateEvent) => {
      //   if (e.readyState >= 2) {
      //     setIsLoading(false);
      //   }
      // });
    } else {
      alert('Please insert a prompt!');
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResult('');
  };

  return (
    <Flex
      width='100vw'
      height='100vh'
      alignContent='center'
      justifyContent='center'
      bgGradient='linear-gradient(to bottom, #00d9ff, #004d80)'
    >
      <Box maxW='2xl' m='0 auto' p='20px'>
        <Textarea
          value={prompt}
          placeholder='Insert your prompt here...'
          mt='30px'
          mb='1rem'
          size='lg'
          onChange={handlePromptChange}
        />

        <Button loading={isLoading} loadingText='Loading...' colorScheme='teal' onClick={handleSubmit} mr='1rem'>
          Submit Prompt
        </Button>

        <Button colorScheme='teal' onClick={handleClear}>
          Clear
        </Button>

        {!!result && (
          <Box>
            <Heading as='h5' textAlign='left' fontSize='lg' mt='1rem'>
              Result:
            </Heading>

            <Text fontSize='lg' textAlign='left' mt='1rem'>
              {result}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default App;
