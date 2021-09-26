#pragma once

#ifndef _IMAGE_PROXY_HPP_
#define _IMAGE_PROXY_HPP_

#define OHTOAI_USE_BOOST

#include "ohtoai_base.hpp"
#include <iterator>
#include <fstream>
#include <set>
#include <algorithm>
#include <httplib.h>

namespace ohtoai
{
	struct ImageFileInfo;


	class ImageProxy
	{
		constexpr static auto SettingConfigPath{ "image_proxy.config" };
		inline const static log::Log Logger{ "image_proxy.log" };

#if defined WIN32 || defined _WIN32
		std::string fileStorageBase{ R"(storage/)" };
		std::string fileUrlBase{ R"(//localhost/img/)" };
#else
		std::string fileStorageBase{ R"(/home/ohtoai/html/assets/img/storage/)" };
		std::string fileUrlBase{ R"(//thatboy.info/img/)" };
#endif
		std::string assemblyPath{ "assembly.dat" };


		OHTOAI_DEFINE_TYPE_INTRUSIVE(ImageProxy, fileStorageBase, fileUrlBase, assemblyPath);
	public:
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileUrlBase, FileUrlBase);
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileStorageBase, FileStorageBase);
		OHTOAI_DEFINE_TYPE_GETTER_SETTER_INTRUSIVE(assemblyPath, AssemblyPath);

		friend struct ImageFileInfo;
	private:
		ImageProxy(const ImageProxy&) = default;
		ImageProxy& operator = (const ImageProxy&) = default;

		ImageProxy()
		{
			::srand(static_cast<unsigned int>(::time(nullptr)));

			loadConfig();
		}

		const std::string mergeImageStorage(std::string storage)
		{
			return getFileStorageBase() + storage;
		}

		const std::string mergeImageUrl(std::string storage)
		{
			return getFileUrlBase() + storage;
		}

	public:
		static ImageProxy& instance();
	public:
		std::vector<const ImageFileInfo*> fetchImageSet(std::set<std::string> authors = {}, std::set<std::string> tags = {}) const;

		std::string viewImageHtmlPage(std::string fileUrl)const;

		void loadConfig();
		void saveConfig();
		void loadData();
		void saveData();
		void syncWithFile();

		std::string viewImageHtmlPage(const ImageFileInfo& info)const;

		ImageFileInfo createImageFile() const;

		const ImageFileInfo* storageImage(ImageFileInfo&& info, std::string&& content);

		void removeImage(std::vector<const ImageFileInfo*> infos);

		const ImageFileInfo* fetchImage(std::string fileName);

		virtual ~ImageProxy();
	protected:
		std::vector<ImageFileInfo> imageFileInfoList;
	};
	
	struct ImageFileInfo
	{
	protected:
		std::string uid{ "00000000-0000-0000-0000-000000000000" };	// uid
		std::string name{ "null" };         // origin name
		std::string time{ "null" };			// time
		std::string author{ "null" };		// author
		std::string type{ "png" };			// type
		size_t size{};							// file size
		int width{};							// image width
		int height{};							// image height
		std::set<std::string> tags;				// tags

		mutable std::string storage{};			// [generated not save] storage file name
		mutable std::string url{};				// [generated] url
	public:
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(uid, UID);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(name, Name);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(time, Time);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(author, Author);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(width, Width);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(height, Height);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(type, Type);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(size, Size);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(tags, Tags);

		std::string getStorage() const
		{
			if (storage.empty()&& !uid.empty() && !type.empty())
			{
				storage = uid + '.' + type;
			}
			return storage;
		}

		void completeInfo()
		{
			setTime(time::getFormatedServerTime(0, false));
			storage = uid + '.' + type;
			url = ImageProxy::instance().mergeImageUrl(getStorage());			
		}
		std::string getUrl() const
		{
			if (url.empty()&& !getStorage().empty())
			{
				url = ImageProxy::instance().mergeImageUrl(getStorage());
			}
			return url;
		}
		
		OHTOAI_DEFINE_TYPE_INTRUSIVE(ImageFileInfo, uid, name, time, author, width, height, type, size, tags, url);
	};
	
	inline std::vector<const ImageFileInfo*> ImageProxy::fetchImageSet(std::set<std::string> authors, std::set<std::string> tags) const
	{
		std::vector<const ImageFileInfo*> limitedFileInfos;
		for (const auto& info : imageFileInfoList)
		{
			bool ifAllLimitMatched = true;

			if (!authors.empty() && authors.find(info.getAuthor()) == authors.end())
				continue;

			if (!tags.empty() && !std::includes(info.getTags().begin(), info.getTags().end(), tags.begin(), tags.end()))
				continue;

			// todo
			limitedFileInfos.push_back(&info);
		}
		return limitedFileInfos;
	}

	inline std::string ImageProxy::viewImageHtmlPage(std::string fileUrl) const
	{
		return std::string{ R"(<!DOCTYPE html><html lang="en"><style>*{border:0;margin:0;width:100%;height:100%}*::-webkit-scrollbar{display:none}</style><iframe src=")" } + fileUrl + R"("></iframe></html>")";
	}

	inline void ImageProxy::loadConfig() {
		std::ifstream ifs(SettingConfigPath);
		if (!ifs)
		{
			LOG_INFO("Config missing.");
			saveConfig();
		}
		else
		{
			std::istreambuf_iterator<char> beg(ifs), end;
			from_json(nlohmann::json::parse(std::string(beg, end)), *this);
			LOG_INFO("Config readed.");
		}

		LOG_INFO("File storage at ", getFileStorageBase());
		LOG_INFO("Assembly at ", getAssemblyPath());
		LOG_INFO("File url at ", getFileUrlBase());
		if (!file::access(getFileStorageBase()))
		{
			file::createDirectoryRecursively(getFileStorageBase());
			LOG_INFO("Create folder ", getFileStorageBase());
		}
		loadData();
	}

	inline void ImageProxy::saveConfig()
	{
		std::thread{
			[=] {
					nlohmann::json j = *this;
					auto storageData{ j.dump() };
					std::ofstream ofs(SettingConfigPath);
					ofs.write(storageData.data(), storageData.size());
					ofs.close();
					LOG_INFO("Config saved.");
				}
		}.detach();
	}

	inline void ImageProxy::loadData()
	{
		std::ifstream ifs(getAssemblyPath());
		if (!ifs)
		{
			LOG_INFO("Assembly missing.");
			saveData();
		}
		else
		{
			std::istreambuf_iterator<char> beg(ifs), end;
			nlohmann::json::parse(std::string(beg, end)).get_to(imageFileInfoList);
			LOG_INFO("Assembly readed.");
		}
	}

	inline void ImageProxy::saveData()
	{
		std::thread{
			[=] {
					nlohmann::json j = imageFileInfoList;
					auto storageData{ j.dump() };
					std::ofstream ofs(getAssemblyPath());
					ofs.write(storageData.data(), storageData.size());
					ofs.close();
					LOG_INFO("Assembly saved.");
				}
		}.detach();
	}

	inline void ImageProxy::syncWithFile()
	{
		bool ifUpdate = false;
		for (auto it = imageFileInfoList.begin(); it != imageFileInfoList.end();)
		{
			if (!file::access(mergeImageStorage(it->getStorage())))
			{
				it = imageFileInfoList.erase(it);
				ifUpdate = true;
			}
			else
				it++;
		}
		if (ifUpdate)
			saveData();
	}

	inline std::string ImageProxy::viewImageHtmlPage(const ImageFileInfo& info) const
	{
		return viewImageHtmlPage(info.getUrl());
	}

	inline ImageFileInfo ImageProxy::createImageFile() const
	{
		ImageFileInfo info;
		info.setUID(uuid::generateUUID());
		return info;
	}

	inline const ImageFileInfo* ImageProxy::storageImage(ImageFileInfo&& info, std::string&& content)
	{
		// storage
		info.completeInfo();

		// save file thread
		std::thread{ [=](std::string storage, std::string&& content)
			{
				std::ofstream ofs(mergeImageStorage(storage), std::ios::binary);
				ofs.write(content.data(), content.size());
				ofs.close();
				LOG_INFO(storage, "Saved[", content.size(), "Bytes].");
			}, info.getStorage(), std::forward<std::string>(content) }.detach();

			LOG_INFO(info.getUID(), "["+info.getName()+"]uploaded.", info.getWidth(), "x", info.getHeight(), "author:", info.getAuthor(), "tags:", nlohmann::json(info.getTags()).dump());
			imageFileInfoList.push_back(std::forward<ImageFileInfo>(info));

		// save data
		saveData();

		return &imageFileInfoList.back();
	}

	inline void ImageProxy::removeImage(std::vector<const ImageFileInfo*> infos)
	{
		bool ifDelete = false;
		for (auto info : infos)
		{
			if (info != nullptr)
			{
				ifDelete = true;
				::remove(mergeImageStorage(info->getStorage()).c_str());
			}
		}
		if (ifDelete)
			syncWithFile();
	}

	inline const ImageFileInfo* ImageProxy::fetchImage(std::string fileName)
	{
		for (auto& info : imageFileInfoList)
		{
			if (info.getStorage() == fileName)
				return &info;
		}
		return nullptr;
	}

	inline ImageProxy::~ImageProxy()
	{
		saveConfig();
		saveData();
	}

	inline ImageProxy& ImageProxy::instance()
	{
		static ImageProxy _instance;
		return _instance;
	}
}

#endif // _IMAGE_PROXY_HPP_