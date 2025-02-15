
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateQuestion } from "./DateQuestion";
import { SubCategorySelector } from "./SubCategorySelector";
import { DynamicQuestion } from "./DynamicQuestion";
import type { SectorQuestionsProps, SubCategory, Question } from "./types";

export function SectorQuestions({ sectorId, answers, setAnswers }: SectorQuestionsProps) {
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
          .single();

        if (error) throw error;

        setSelectedSubCategory("");
        
        const rawSubCategories = data?.sub_categories as any[] || [];
        const validSubCategories = rawSubCategories.filter((sc): sc is SubCategory => {
          return (
            typeof sc?.id === 'string' &&
            typeof sc?.name === 'string' &&
            Array.isArray(sc?.questions)
          );
        });
        
        console.log('Fetched sub-categories:', validSubCategories); // Debug log
        setSubCategories(validSubCategories);
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

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error loading questions: {error}</div>;

  return (
    <div className="space-y-6">
      <DateQuestion
        label="Date of Incident/Concern"
        required
        value={answers.incidentDate}
        onChange={(date) => handleAnswerChange('incidentDate', date)}
        questionId="incidentDate"
      />

      <SubCategorySelector
        subCategories={subCategories}
        selectedSubCategory={selectedSubCategory}
        onSubCategoryChange={setSelectedSubCategory}
      />

      {questions.map((question) => (
        <DynamicQuestion
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => handleAnswerChange(question.id, value)}
        />
      ))}
    </div>
  );
}
