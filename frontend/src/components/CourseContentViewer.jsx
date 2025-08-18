import { CheckCircle, Clock, Play } from "lucide-react";
import { getContentIcon } from "../utils/learnPage";
import {
  setCompletedTopics,
  setSelectedTopic,
  setExpandedModules,
} from "../redux/slices/learningPage";
import { useSelector, useDispatch } from "react-redux";
import courseData from "../data/pensionLearningData.json";

const CourseContentViewer = ({ topic }) => {
  const { completedTopics, selectedTopic, expandedModules } = useSelector(
    (state) => state.learningPage
  );
  const dispatch = useDispatch();
  const markComplete = (topicId) => {
    if (!completedTopics.includes(topicId)) {
      const newCompleted = [...completedTopics, topicId];
      dispatch(setCompletedTopics(newCompleted));
    }
  };

  const handleNextTopic = () => {
    let foundCurrent = false;

    for (let i = 0; i < courseData.modules.length; i++) {
      const module = courseData.modules[i];

      for (let j = 0; j < module.topics.length; j++) {
        const topic = module.topics[j];

        if (topic.id === selectedTopic.id) {
          foundCurrent = true;

          if (j + 1 < module.topics.length) {
            const nextTopic = module.topics[j + 1];
            dispatch(setSelectedTopic(nextTopic));
            return;
          }

          for (let k = i + 1; k < courseData.modules.length; k++) {
            const nextModule = courseData.modules[k];
            dispatch(setExpandedModules([...expandedModules, nextModule.id]));
            if (nextModule.topics.length > 0) {
              dispatch(setSelectedTopic(nextModule.topics[0]));
              return;
            }
          }

          console.log("End of course reached");
          return;
        }
      }
    }

    if (!foundCurrent) {
      console.warn("Current topic not found in course data");
    }
  };

  if (!topic) return null;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {getContentIcon(topic.type)}
          <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {topic.duration}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {topic.type.charAt(0).toUpperCase() + topic.type.slice(1)}
          </span>
        </div>
      </div>

      {topic.type === "video" && topic.videoId && (
        <div className="mb-6">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${topic.videoId}?rel=0&modestbranding=1&showinfo=0`}
              title={topic.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>Video Lesson</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Duration: {topic.duration}</span>
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${topic.videoId}`,
                    "_blank"
                  )
                }
              >
                Watch on YouTube ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {topic.type === "article" && (
        <div className="prose max-w-none mb-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Article Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {topic.content ||
                "This is where the article content would be displayed. The content would be loaded from the data.json file and could include rich text formatting, images, and embedded media."}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The article would cover comprehensive information about the topic,
              including practical examples, case studies, and actionable advice
              for retirement planning.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                Key Takeaways
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Understanding is the foundation of good planning</li>
                <li>• Early action leads to better outcomes</li>
                <li>• Regular review and adjustment is essential</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {topic.type === "infographic" && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg border-2 border-dashed border-blue-300">
            <Image className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <p className="text-center text-gray-700">Interactive Infographic</p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Visual comparison charts and diagrams would be displayed here
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-black/30">
        <button
          onClick={() => markComplete(topic.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            completedTopics.includes(topic.id)
              ? "bg-green-100 text-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {completedTopics.includes(topic.id)
            ? "Completed"
            : "Mark as Complete"}
        </button>
        <button
          onClick={handleNextTopic}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-blue-700"
        >
          <CheckCircle className="w-4 h-4" />
          Next
        </button>
      </div>
    </div>
  );
};

export default CourseContentViewer;
