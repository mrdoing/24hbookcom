import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Flex, Button } from '@chakra-ui/react';
import BooksView, { BooksViewProps } from './BooksView';
import { Book, SearchQuery } from '../scripts/searcher';
import { ArrowDownIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import search from '../scripts/searcher';
import { useLayoutEffect } from 'react';
import IndexBooksView from './IndexBooksView';

const BookRecommendations: React.FC = () => {
  const categories = ['文学', '心理', '艺术', '设计', '小说', '哲学', '传记', '教育', '历史', '宗教', '计算', '理财', '政治', '军事', '儿童'];
  const pageSize = 20; // 每页显示的数量

  const [booksByCategory, setBooksByCategory] = useState<{ [key: string]: Book[] }>({});

  const fetchBooksForCategory = async (category: string, offset = 0) => {
    try {
      const response = await search({ query: category, limit: pageSize, offset });
      const newBooks = response.books || [];

      // Fisher-Yates 随机置换算法
      for (let i = newBooks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBooks[i], newBooks[j]] = [newBooks[j], newBooks[i]];
      }

      setBooksByCategory((prev) => ({
        ...prev,
        [category]: offset === 0 ? newBooks : [...(prev[category] || []), ...newBooks],
      }));
    } catch (error) {
      console.error('Error fetching books for category:', category, error);
    }
  };

  const loadMoreBooks = async (category: string) => {
    const offset = (booksByCategory[category]?.length || 0);
    fetchBooksForCategory(category, offset);
  };

  useLayoutEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories[0];
      fetchBooksForCategory(defaultCategory);
    }
  }, []);

  const emojis = ['📚', '🧠', '🎨', '✏️', '📖', '🤔', '📜', '📚', '📜', '⛪️', '💻', '💰', '🏛️', '⚔️', '🧒'];


  return (
    <Flex direction={{ base: 'row', md: 'column' }} px={{ base: 0, md: 4 }} py={0} align="center" mt={4} mb={4}>
      <Tabs width="100%" variant='soft-rounded' colorScheme='green'>
        <TabList
          px={{ base: 4, md: 4 }}
          mb={{ base: 4, md: 4 }}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {categories.map((category, index) => (
            <Tab key={category} onClick={() => fetchBooksForCategory(category)}>
              {emojis[index as number]} {category}
            </Tab>
          ))}
        </TabList>
        <TabPanels px="0">
          {categories.map((category) => (
            <TabPanel key={category} px={0}>
              <Flex direction="column">
                {booksByCategory[category] ? (
                  <IndexBooksView
                    books={booksByCategory[category]}
                    pagination={{ pageSize, pageIndex: 0 }}
                    pageCount={0}
                    showPagination={false}
                  />
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '220px', marginBottom: '700px' }}>加载中...</p>

                )}
                <Flex justify="center" alignItems="center" px={{ base: 4, md: 4 }}>
                  <Button
                    width={{ base: '100%', md: '300px' }}
                    rightIcon={<ArrowDownIcon />}
                    mt={4}
                    onClick={() => loadMoreBooks(category)}
                  >
                    查看更多
                  </Button>
                </Flex>
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default BookRecommendations;