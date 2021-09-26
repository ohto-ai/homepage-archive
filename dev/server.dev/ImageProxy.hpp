#pragma once

#ifndef _IMAGE_PROXY_HPP_
#define _IMAGE_PROXY_HPP_

#define OHTOAI_USE_BOOST

#include "ohtoai_base.hpp"
#include <iterator>
#include <fstream>
#include <set>
#include <algorithm>

namespace ohtoai
{
	struct ImageFileInfo
	{
	protected:
		std::string storage{};      // storage file name
		std::string name{};         // origin name
		std::string url{};          // url
		std::string time{};			// time
		std::string author;			// author
		size_t size{};              // file size
		std::set<std::string> tags;	// tags
	public:
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(storage, Storage);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(name, Name);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(url, Url);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(time, Time);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(author, Author);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(size, Size);
		OHTOAI_DEFINE_TYPE_REFER_GETTER_SETTER_INTRUSIVE(tags, Tags);

        NLOHMANN_DEFINE_TYPE_INTRUSIVE(ImageFileInfo, storage, name, url, time, author, size, tags);
	};

	class ImageProxy
	{
		constexpr static auto SettingConfigPath{ "imageproxy.config" };
		
#ifdef _WIN32
		std::string fileStorageBase{ R"(storage/storage/)" };
		std::string fileUrlBase{ R"(//localhost/storage/)" };
#else
		std::string fileStorageBase{ R"(/home/ohtoai/html/assets/img/storage/)" };
		std::string fileUrlBase{ R"(//thatboy.info/img/)" };
#endif
		NLOHMANN_DEFINE_TYPE_INTRUSIVE(ImageProxy, fileStorageBase, fileUrlBase, imageFileInfoList);
	public:
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileUrlBase, FILEileUrlBase);
		OHTOAI_DEFINE_TYPE_GETTER_INTRUSIVE(fileStorageBase, FileStorageBase);

	private:
		ImageProxy(const ImageProxy&) = default;
		ImageProxy& operator = (const ImageProxy&) = default;
		
        ImageProxy()
        {
            srand(::time(nullptr));

			loadConfig();
        }
		const std::string mergeImageStorage(std::string storage)
		{
			return fileStorageBase + storage;
		}

		const std::string mergeImageUrl(std::string storage)
		{
			return fileUrlBase + storage;
		}

	public:
		std::vector<const ImageFileInfo*> fetchImageSet(std::set<std::string> authors = {}, std::set<std::string> tags = {}) const
		{

			std::vector<const ImageFileInfo*> limitedFileInfos;
			for (const auto& info : imageFileInfoList)
			{
				bool ifAllLimitMatched = true;

				if(!authors.empty()&&authors.find(info.getAuthor())== authors.end())
					continue;
			
				if(!tags.empty()&&!std::includes(info.getTags().begin(), info.getTags().end(), tags.begin(), tags.end()))
					continue;
					
				// todo
				limitedFileInfos.push_back(&info);
			}
			return limitedFileInfos;
		}

		std::string viewImageHtmlPage(std::string fileUrl)const
		{
			return std::string{ R"(<!DOCTYPE html><html lang="en"><style>*{border:0;margin:0;width:100%;height:100%}*::-webkit-scrollbar{display:none}</style><iframe src=")" } + fileUrl + R"("></iframe></html>")";
		}

		void loadConfig() {
			std::ifstream ifs(SettingConfigPath);
			if (!ifs)
			{
				saveConfig();
			}
			else
			{
				std::istreambuf_iterator<char> beg(ifs), end;
				from_json(nlohmann::json::parse(std::string(beg, end)), *this);
			}

			if (!file::access(fileStorageBase))
				file::createDirectoryRecursively(fileStorageBase);
		}

		void saveConfig()
		{
			nlohmann::json j = *this;
			auto storageData{ j.dump(4) };
			std::ofstream ofs(SettingConfigPath);
			ofs.write(storageData.data(), storageData.size());
			ofs.close();
		}

		void syncWithFile()
		{
			bool ifUpdate = false;
			for(auto it = imageFileInfoList.begin(); it!=imageFileInfoList.end();)
			{
				if(!file::access(mergeImageStorage(it->getStorage())))
				{
					it = imageFileInfoList.erase(it);
					ifUpdate = true;
				}
				else
					it++;
			}
			if(ifUpdate)
				saveConfig();
		}

		std::string viewImageHtmlPage(const ImageFileInfo&info)const
		{
			return viewImageHtmlPage(info.getUrl());
		};

		const ImageFileInfo* storageImage(std::string name, std::string ext, const std::string& content, std::string author, std::set<std::string> tags)
		{
			// storage

			if (ext.empty())
				ext = ".png";
			if (ext.front() != '.')
				ext = '.' + ext;

			ImageFileInfo info;
			info.setName(name);
			info.setStorage(uuid::generateUUID() + ext);
			info.setSize(content.size());
			info.setUrl(mergeImageUrl(info.getStorage()));
			info.setAuthor(author);
			info.setTime(time::getFormatedServerTime(0, false));
			info.setTags(tags);
						
			std::ofstream ofs(mergeImageStorage(info.getStorage()), std::ios::binary);
			ofs.write(content.data(), content.size());
			ofs.close();

			imageFileInfoList.push_back(info);
			return &imageFileInfoList.back();
		}

		void removeImage(std::vector<const ImageFileInfo*> infos)
		{
			bool ifDelete = false;
			for(auto info:infos)
			{
				if(info!=nullptr)
				{
					ifDelete = true;
					::remove(mergeImageStorage(info->getStorage()).c_str());
				}
			}
			if(ifDelete)
				syncWithFile();
		}

		const ImageFileInfo*fetchImage(std::string fileName)
		{
			for(auto& info:imageFileInfoList)
			{
				if(info.getStorage() == fileName)
					return &info;
			}
			return nullptr;
		}

		virtual ~ImageProxy()
		{
			saveConfig();
		}
	protected:
		std::vector<ImageFileInfo> imageFileInfoList;

    public:
        static ImageProxy& instance()
        {
            static ImageProxy _instance;
            return _instance;
        }
	};

}


#endif // _IMAGE_PROXY_HPP_