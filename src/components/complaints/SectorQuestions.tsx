
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubCategorySelector } from "./SubCategorySelector";
import { DynamicQuestion } from "./DynamicQuestion";
import type { SectorQuestionsProps, SubCategory, Question } from "./types";
import type { LanguageCode } from "@/types/complaints";

interface ExtendedSectorQuestionsProps extends SectorQuestionsProps {
  language: LanguageCode;
}

export function SectorQuestions({ sectorId, answers, setAnswers, language }: ExtendedSectorQuestionsProps) {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('sub_categories')
          .eq('id', sectorId)
          .maybeSingle();

        if (error) throw error;

        setSelectedSubCategory("");
        
        const rawSubCategories = data?.sub_categories as any[] || [];
        // Ensure unique subcategories by ID
        const uniqueSubCategories = Array.from(
          new Map(
            rawSubCategories
              .filter((sc): sc is SubCategory => {
                return (
                  typeof sc?.id === 'string' &&
                  typeof sc?.name === 'string' &&
                  Array.isArray(sc?.questions)
                );
              })
              .map(item => [item.id, item])
          ).values()
        );
        
        setSubCategories(uniqueSubCategories);
        setQuestions([]);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching sector data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sectorId) {
      fetchSectorData();
      // Reset answers related to previous sector's questions
      const updatedAnswers = { ...answers };
      delete updatedAnswers.selectedSubCategory;
      setAnswers(updatedAnswers);
    }
  }, [sectorId]);

  useEffect(() => {
    if (selectedSubCategory) {
      const subCategory = subCategories.find(sc => sc.id === selectedSubCategory);
      if (subCategory) {
        setQuestions(subCategory.questions);
      } else {
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
  }, [selectedSubCategory, subCategories]);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error loading questions: {error}</div>;

  return (
    <div className="space-y-6">
      {subCategories.length > 0 && (
        <SubCategorySelector
          subCategories={subCategories}
          selectedSubCategory={selectedSubCategory}
          onSubCategoryChange={setSelectedSubCategory}
        />
      )}

      {questions.map((question) => (
        <DynamicQuestion
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
          language={language}
        />
      ))}
    </div>
  );
}
