#include "ImageProxy.hpp"

int main()
{
	httplib::Server s;

	auto splitToSet = [](std::string list)
	{
		std::set<std::string> tags;
		auto vec {ohtoai::string::split(list, ",\\s*")};
		for(auto&tag:vec)
			if(!tag.empty())
				tags.emplace(tag);
		return tags;
	};

	
	auto& proxy = ohtoai::ImageProxy::instance();

	s.Get("/api/img", [&](const httplib::Request& req, httplib::Response& res)
		{
			LOG_INFO(req.method, ":", req.path, nlohmann::json(req.params).dump());
			nlohmann::json j;

			const auto invalidProcess = [&]
			{
				res.set_redirect("//thatboy.info/api/");
			};

			const auto emptyProcess = [&]
			{
				res.set_content(proxy.viewImageHtmlPage("//thatboy.info/404.html"), "text/html");
				res.status = 404;
			};

			std::string op{ "get" }, type{ "page" };

			// get parameters
			if (req.has_param("op"))
				op = req.get_param_value("op");
			if (req.has_param("type"))
				type = req.get_param_value("type");

			
			if (op == "get")
			{
				if (type == "page")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_content(proxy.viewImageHtmlPage(*info), "text/html");
					}
				}
				else if (type == "direct")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));	
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_redirect(info->getUrl());
					}
				}
				else if (type == "dump")
				{
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));	
					if(set.empty())
						emptyProcess();
					else{
						auto info = set.at(rand() % set.size());
						res.set_content(nlohmann::json(*info).dump(4), "application/json");
					}
				}
				else if (type == "list")
				{
					nlohmann::json j;
					auto set = proxy.fetchImageSet(splitToSet(req.get_param_value("author")), splitToSet(req.get_param_value("tags")));
					j["count"] = set.size();

					for (auto& info : set)
					{
						j["list"].push_back(*info);
					}
					j["error"] = "ok";
					j["status"] = 200;
					res.set_content(j.dump(4), "application/json");
				}
				else
				{
					invalidProcess();
				}
			}
			else if(op == "sync")
			{
				proxy.syncWithFile();
				
				nlohmann::json j;
				auto set = proxy.fetchImageSet();
				j["count"] = set.size();

				for (auto& info : set)
				{
					j["list"].push_back(*info);
				}
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "delete")
			{
				bool ifUseFileName = req.has_param("storage");

				nlohmann::json j;

				if(ifUseFileName)
				{
					auto storage = req.get_param_value("storage");
					proxy.removeImage({proxy.fetchImage(storage)});	
					j["storage"] = storage;
					j["error"] = "ok";
				}
				else
				{
					auto authors = splitToSet(req.get_param_value("author"));
					auto tags = splitToSet(req.get_param_value("tags"));
					if(!authors.empty()||!tags.empty())
					{
						proxy.removeImage(proxy.fetchImageSet(authors, tags));
						j["error"] = "ok";
					}
					else
					{
						j["error"] = "need select author or tags";
					}
					j["author"] = authors;
					j["tags"] = tags;
				}

				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "reload")
			{
				proxy.loadConfig();
				
				nlohmann::json j;
				auto set = proxy.fetchImageSet();
				j["count"] = set.size();

				for (auto& info : set)
				{
					j["list"].push_back(*info);
				}
				j["error"] = "ok";
				j["status"] = 200;
				res.set_content(j.dump(4), "application/json");
			}
			else if(op == "upload")
			{
				res.set_redirect("//thatboy.info/upload/");
			}
			else
			{
				invalidProcess();
			}
		});

	s.Post("/api/img", [&](const httplib::Request& req, httplib::Response& res)
		{
			LOG_INFO(req.method, ":", req.path, nlohmann::json(req.params).dump());
			nlohmann::json j;
			if (req.has_param("op") && req.get_param_value("op") == "upload")
			{
				auto authorIncome = req.get_file_value("author").content;
				auto author = authorIncome.empty() ? "undefined" : authorIncome;

				auto tags = splitToSet(req.get_file_value("tags").content);
				
				auto info{ std::move(proxy.createImageFile()) };
				info.setAuthor(author);
				info.setTags(tags);
				
				info.setWidth(ohtoai::string::stringTo<int>(req.get_file_value("width").content));
				info.setHeight(ohtoai::string::stringTo<int>(req.get_file_value("height").content));
				info.setType(req.get_file_value("type").content);

				const auto& fileFormData = req.get_file_value("file");
				info.setName(fileFormData.filename);
				info.setSize(fileFormData.content.size());
					
				j["img"] = *proxy.storageImage(std::move(info), std::move(*const_cast<std::string*>(&fileFormData.content)));
								
				j["error"] = "ok";
				j["status"] = 200;
			}
			else
			{
				j["error"] = "unknow command";
				j["status"] = 404;
			}
			res.set_content(j.dump(4), "application/json");
		});

	s.Get("/shutdown", [&](const auto&, auto&)
		{
			s.stop();
		});

	s.set_mount_point("/", ".");
#if defined WIN32 || defined _WIN32
	s.set_mount_point("/img", ohtoai::ImageProxy::instance().getFileStorageBase().c_str());
	s.set_mount_point("/", "../../../");
#endif

	return s.listen("0.0.0.0", 80);
}
