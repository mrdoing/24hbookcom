import { Flex, Box, Select, Input, Icon, Menu, MenuButton, MenuList, MenuItem, Button, InputGroup, InputRightElement } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { TbBook2, TbBuilding, TbHash, TbReportSearch, TbUserCircle } from 'react-icons/tb';
import search, { Book } from '../scripts/searcher';
import { useDebounce, usePrevious } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import { ChevronDownIcon, CloseIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';

function rmEmptyString<T extends { [s: string]: unknown }>(query: T) {
  return Object.fromEntries(Object.entries(query).filter(([_, v]) => v !== '')) as T;
}

interface SearchProps {
  pagination: {
    pageSize: number;
    pageIndex: number;
  };
  setPageCount: (pageCount: number) => void;
  resetPageIndex: () => void;
  setBooks: (books: Book[]) => void;
}

interface SearchOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const searchOptions: SearchOption[] = [
  { value: 'complex', label: '搜书', icon: <Icon as={TbReportSearch} boxSize={6} color="gray.500" mr={2} /> },
  { value: 'title', label: '书名', icon: <Icon as={TbBook2} boxSize={6} color="gray.500" mr={2} /> },
  { value: 'author', label: '作者', icon: <Icon as={TbUserCircle} boxSize={6} color="gray.500" mr={2} /> },
  { value: 'publisher', label: '出版社', icon: <Icon as={TbBuilding} boxSize={6} color="gray.500" mr={2} /> },
  { value: 'isbn', label: 'ISBN编号', icon: <Icon as={TbHash} boxSize={6} color="gray.500" mr={2} /> },
];

const Search: React.FC<SearchProps> = ({ setBooks, pagination, setPageCount, resetPageIndex }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isbn, setISBN] = useState<string>('');
  const clearInput = () => {
    setSearchText('');
    setAuthor('');
    setPublisher('');
    setISBN('');
  };


  const [selectedOption, setSelectedOption] = useState<string>('complex');
  const [searchText, setSearchText] = useState<string>('');


  let queryKey = {};

  if (selectedOption === 'complex') {
    queryKey = { query: searchText };
  } else if (selectedOption === 'title') {
    queryKey = { title: searchText };
  } else if (selectedOption === 'author') {
    queryKey = { author: searchText };
  } else if (selectedOption === 'publisher') {
    queryKey = { publisher: searchText };
  } else if (selectedOption === 'isbn') {
    queryKey = { isbn: searchText };
  }

  queryKey = useDebounce(rmEmptyString(queryKey), { wait: 300 });






  const prevQueryKey = usePrevious(queryKey);

  const result = useQuery({
    queryKey: ['search', { ...queryKey, limit: pagination.pageSize, offset: pagination.pageIndex * pagination.pageSize }],
    queryFn: () =>
      search({
        ...queryKey,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      }),
    keepPreviousData: true,
  });
  useEffect(() => {
    console.log('Search parameters:', {
      selectedOption,
      title,
      author,
      publisher,
      isbn,
      query: searchText,
    });

    if (result.data) {
      const { books, total } = result.data;
      console.log('Received data:', books);
      if (books !== undefined) setBooks(books);
      setPageCount(Math.ceil(total / pagination.pageSize));
    }
  }, [result.data]);

  const { colorMode } = useColorMode();
  return (

    <Flex direction={{ base: 'row' }} px={{ base: 4, md: 8 }} py={0} gap="2" align="center" mb={4}>
      <Menu >
        <MenuButton
          as={Button}
          display="flex"
          rightIcon={<ChevronDownIcon />}
          px={2}
          py={2}
          bg={colorMode === 'dark' ? 'rgb(26, 32, 44)' : 'white'}
          transition='all 0.2s'
          borderRadius='md'
          borderWidth='1px'
          alignItems="center"
        >
          <Flex align="center">
            {searchOptions.find((option) => option.value === selectedOption)?.icon}
            {searchOptions.find((option) => option.value === selectedOption)?.label}
          </Flex>
        </MenuButton>
        <MenuList>
          {searchOptions.map((option) => (
            <MenuItem key={option.value} onClick={() => setSelectedOption(option.value)}>
              {option.icon} {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <InputGroup flex="1">
        <Input
          placeholder={`${t('输入关键词搜索')} `}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <InputRightElement pr="2">
            <CloseIcon boxSize={3} color="gray.500" cursor="pointer" onClick={clearInput} />
          </InputRightElement>
        )}
      </InputGroup>
    </Flex>


  );
};

export default Search;
