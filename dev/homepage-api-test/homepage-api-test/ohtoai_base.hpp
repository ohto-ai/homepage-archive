#pragma once

#ifndef _OHTOAI_BASE_HPP_
#define _OHTOAI_BASE_HPP_
#ifndef _CRT_SECURE_NO_WARNINGS
#define _NODEFINE_CRT_SECURE_NO_WARNINGS
#endif
#define _CRT_SECURE_NO_WARNINGS
#include <json.hpp>
#include <vector>
#include <regex>
#include <chrono>
#include <iostream>
#include <fstream>
#include <sstream>
#include <iomanip>

#ifdef OHTOAI_USE_BOOST

#include <boost/uuid/uuid_io.hpp>
#include <boost/uuid/detail/md5.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/algorithm/hex.hpp>
#include <boost/algorithm/string.hpp>
#include <boost/functional/hash.hpp>

#endif

#if defined WIN32 || defined _WIN32
#define OHTOAI_WINDOWS_PLATFORM
#include <io.h>
#include <direct.h>
#else
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>
#include <errno.h>
#endif

#define OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(member, Member) \
    auto get##Member() const                                \
    {                                                       \
        return member;                                      \
    }

#define OHTOAI_DEFINE_TYPE_REFER_GETTER_INTRUSIVE(member, Member) \
    const auto& get##Member() const                                \
    {                                                       \
        return member;                                      \
    }
#define OHTOAI_DEFINE_TYPE_SETTER_INTRUSIVE(member, Member) \
    void set##Member(decltype(member) _##member)            \
    {                                                       \
        member = _##member;                                 \
    }
#define OHTOAI_DEFINE_TYPE_REFER_SETTER_INTRUSIVE(member, Member) \
    void set##Member(const decltype(member)& _##member)            \
    {                                                       \
        member = _##member;                                 \
    }

#define OHTOAI_DEFINE_TYPE_GETTER_SETTER_INTRUSIVE(member, Member) \
    OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(member, Member)            \
    OHTOAI_DEFINE_TYPE_SETTER_INTRUSIVE(member, Member)
#define OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(member, Member) \
    OHTOAI_DEFINE_TYPE_REFER_GETTER_INTRUSIVE(member, Member)            \
    OHTOAI_DEFINE_TYPE_REFER_SETTER_INTRUSIVE(member, Member)

#define OHTOAI_VISITE_PROP_INTRUSIVE(func_, prop_)                \
    decltype(prop_) &func_(std::string path)                      \
    {                                                             \
        auto paths = ohtoai::string::split(path, R"([\\/\.\s])"); \
        auto ptr = &prop_;                                        \
        for (auto &name : paths)                                  \
            if (name.empty())                                     \
                continue;                                         \
            else                                                  \
                ptr = &(*ptr)[name];                              \
        return *ptr;                                              \
    }                                                             \
    const decltype(prop_) &func_(std::string path) const          \
    {                                                             \
        auto paths = ohtoai::string::split(path, R"([\\/\.\s])"); \
        auto ptr = &prop_;                                        \
        for (auto &name : paths)                                  \
            if (name.empty())                                     \
                continue;                                         \
            else                                                  \
                ptr = &(*ptr)[name];                              \
        return *ptr;                                              \
    }

#define OHTOAI_JSON_TO(v1) NLOHMANN_JSON_TO(v1)
#define OHTOAI_JSON_FROM(v1) if(nlohmann_json_j.contains(#v1)) nlohmann_json_j.at(#v1).get_to(nlohmann_json_t.v1);


#define OHTOAI_DEFINE_TYPE_INTRUSIVE(Type, ...)  \
    friend void to_json(nlohmann::json& nlohmann_json_j, const Type& nlohmann_json_t) { NLOHMANN_JSON_EXPAND(NLOHMANN_JSON_PASTE(OHTOAI_JSON_TO, __VA_ARGS__)) } \
    friend void from_json(const nlohmann::json& nlohmann_json_j, Type& nlohmann_json_t) { NLOHMANN_JSON_EXPAND(NLOHMANN_JSON_PASTE(OHTOAI_JSON_FROM, __VA_ARGS__)) }


#ifdef OHTOAI_USE_BOOST
namespace ohtoai::uuid
{
	/**
	 * @description: generate UUID
	 * @return generated UUID
	 */
	std::string generateUUID()
	{
		return to_string(boost::uuids::random_generator()());
	}
}
#endif

namespace ohtoai::string
{
	/**
	 * split string
	 * @param in string
	 * @param regDelim regex separator
	 * @return string vector
	 * @author ohtoai
	 */
	std::vector<std::string> split(const std::string& in, const std::string& regDelim) {
		std::regex re{ regDelim };
		return std::vector<std::string> {
			std::sregex_token_iterator(in.begin(), in.end(), re, -1),
				std::sregex_token_iterator()
		};
	}
	
	template <typename T>
	T stringTo(std::string s)
	{
		std::istringstream ss(s);
		T t{};
		ss >> t;
		return t;
	}
}

namespace ohtoai::log
{
#define LOG_MACRO(TYPE, ...) ohtoai::log::Log::instance().log(ohtoai::time::getFormatedServerTime(0, false), #TYPE, ##__VA_ARGS__)
#define LOG_MACRO_NS(TYPE, ...) ohtoai::log::Log::instance().log_ns(ohtoai::time::getFormatedServerTime(0, false), " ", #TYPE, " ", ##__VA_ARGS__)
#define LOG_MACRO_APPEND(...) ohtoai::log::Log::instance().log(__VA_ARGS__)
#define LOG_INFO(...) LOG_MACRO(INFO, ##__VA_ARGS__)
#define LOG_DEBUG(...) LOG_MACRO_NS(DEBUG, __FILE__, ":", __LINE__, "@", __FUNCTION__, " ");LOG_MACRO_APPEND(__VA_ARGS__)
#define LOG_WARNING(...) LOG_MACRO_NS(WARNING, __FILE__, ":", __LINE__, "@", __FUNCTION__, " ");LOG_MACRO_APPEND(__VA_ARGS__)
#define LOG_ERROR(...) LOG_MACRO_NS(ERROR, __FILE__, ":", __LINE__, "@", __FUNCTION__, " ");LOG_MACRO_APPEND(__VA_ARGS__)
#define LOG_FATAL(...) LOG_MACRO_NS(FATAL, __FILE__, ":", __LINE__, "@", __FUNCTION__, " ");LOG_MACRO_APPEND(__VA_ARGS__)
	class Log
	{
	public:
		Log()
		{
			if (_instance != nullptr && _instance->ofs.is_open())
				_instance->ofs.close();
			_instance = this;
		}
		Log(std::string path)
		{
			if (_instance != nullptr && _instance->ofs.is_open())
				_instance->ofs.close();
			_instance = this;
			ofs.open(path, std::ios::app);
		}
		~Log()
		{
			ofs.close();
		}

	protected:
		Log(const Log&) = delete;
		Log(Log&&) = delete;
		Log& operator=(const Log&) = delete;
		Log& operator=(Log&&) = delete;

		std::ofstream ofs;

	public:
		inline static Log* _instance{ nullptr };
		static Log& instance()
		{
			return *_instance;
		}

		template <typename T>
		void log(const T& t) {
			ofs << t << std::endl;
			ofs.flush();
		}
		template <typename T, typename ... Args>
		void log(const T& t, Args ... args) {
			ofs << t << ' ';
			log(args...);
		}

		template <typename T>
		void log_ns(const T& t) {
			ofs << t;
			ofs.flush();
		}
		template <typename T, typename ... Args>
		void log_ns(const T& t, Args ... args) {
			ofs << t;
			log_ns(args...);
		}
	};
}

namespace ohtoai::file
{
	// FIXME: '/' delim only for linux
	constexpr auto folderDelim{ '/' };
	enum AccessMod
	{
		FILE_EXISTS = 0x00,
		FILE_WRITABLE = 0x02,
		FILE_READABLE = 0x04,
		FILE_WRITABLE_READABLE = FILE_WRITABLE | FILE_READABLE
	};
#ifdef OHTOAI_WINDOWS_PLATFORM
	inline bool access(std::string filename, AccessMod accessMode = FILE_EXISTS)
	{
		return ::_access(filename.c_str(), accessMode) == 0;
	}
	inline bool mkdir(std::string path)
	{
		return ::_mkdir(path.c_str()) == 0;
	}
#else
	inline bool access(std::string filename, AccessMod accessMode = FILE_EXISTS)
	{
		return ::access(filename.c_str(), accessMode) == 0;
	}
	inline bool mkdir(std::string path)
	{
		return ::mkdir(path.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH) == 0;
	}
#endif

	std::vector<std::pair<std::string, int>> listFiles(std::string dir)
	{
		std::vector<std::pair<std::string, int>> fileList;
#ifdef OHTOAI_WINDOWS_PLATFORM
		intptr_t handle;
		_finddata_t findData;
		dir += "*";
		handle = _findfirst(dir.c_str(), &findData);
		if (handle == -1)
		{
			return {};
		}

		do
		{
			if (!(findData.attrib & _A_SUBDIR) && strcmp(findData.name, ".") && strcmp(findData.name, ".."))
				fileList.push_back(std::make_pair(findData.name, findData.size));
		} while (!_findnext(handle, &findData));

		_findclose(handle);

#else
		const auto getFileSize = [](std::string path)
		{
			struct stat statbuff;
			return stat(path.c_str(), &statbuff) < 0 ? -1 : statbuff.st_size;
		};

		DIR* dp;
		struct dirent* dirp;
		if ((dp = opendir(dir.c_str())) == NULL)
		{
			return {};
		}

		while ((dirp = readdir(dp)) != NULL)
		{
			if (strcmp(dirp->d_name, ".") && strcmp(dirp->d_name, ".."))
				fileList.push_back(std::make_pair(dirp->d_name, getFileSize(dir + dirp->d_name)));
		}
		closedir(dp);
#endif

		return fileList;
	}
	/**
	 * @description: create directory recursively
	 * @param path: directory path
	 * @return success
	 */
	bool createDirectoryRecursively(std::string path)
	{
		std::istringstream iss(path);
		std::ostringstream oss;
		std::string folder{};
		bool invalidPath{ false };

		// root folder
		if (path.front() == folderDelim)
			oss << folderDelim;

		while (std::getline(iss, folder, folderDelim))
		{
			if (folder.empty())
				continue;
			oss << folder << folderDelim;
			if (!invalidPath && !access(oss.str()))
				invalidPath = true;

			if (invalidPath)
				if (!mkdir(oss.str()))
					return false;
		}
		return true;
	}
}

namespace ohtoai::time
{
	using time_stamp_t = int64_t;

	/**
	 * @description: get current time stamp
	 * @return time stamp
	 */
	time_stamp_t getTimeStamp()
	{
		return std::chrono::duration_cast<std::chrono::milliseconds>(
			(std::chrono::system_clock::now()).time_since_epoch())
			.count();
	}

	/**
	 * @description: transfer time stamp (ms) to time_t (s)
	 * @param timeStamp: time stamp
	 * @return time_t
	 */
	constexpr time_t timeStamp2Time(time_stamp_t timeStamp)
	{
		return timeStamp / 1000;
	}

	constexpr static auto StandardTimeFormat{ "%Y-%m-%d %H:%M:%S" };
	/**
	 * @description: format time stamp
	 * @param timeStamp: time stamp (ms), zero means now.
	 * @param format: default is "%Y-%m-%d %H:%M:%S"
	 * @return formated string
	 */
	std::string getFormatedServerTime(time_stamp_t timeStamp = 0, bool print_ms = true, std::string format = StandardTimeFormat)
	{
		if (timeStamp == 0)
			timeStamp = getTimeStamp();
		auto currentTime = timeStamp2Time(timeStamp);
		std::ostringstream oss;
		oss << std::put_time(std::localtime(&currentTime), format.c_str());
		if (print_ms)
			oss << '.' << timeStamp % 1000;
		return oss.str();
	}
}

#ifdef _NODEFINE_CRT_SECURE_NO_WARNINGS
#undef _CRT_SECURE_NO_WARNINGS
#endif

#endif